/**
 * Conflict Resolver
 * Resolves conflicts when multiple sources have different states
 *
 * Phase M8: Snapshot generation management
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { ConflictResolutionResult } from './types'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'
import { getLatestSnapshot } from './snapshotManager'
import { isJournalReplayViable } from './journalReplay'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Resolve conflict between local and remote states
 * Returns which source should be used
 */
export const resolveConflict = async (
  sessionId: string,
  options: {
    preferLocal?: boolean
    preferRemote?: boolean
    maxTimeDelta?: number // Max time difference to consider "close enough" (ms)
  } = {}
): Promise<ConflictResolutionResult> => {
  const {
    preferLocal = false,
    preferRemote = false,
    maxTimeDelta = 60 * 1000, // 1 minute default
  } = options

  const notes: string[] = []
  const config = getPersistenceConfig()

  // Load all sources
  let localState: SessionBrainState | undefined
  let remoteState: SessionBrainState | undefined
  let snapshotState: SessionBrainState | undefined

  try {
    localState = await localBrainPersistence.load(sessionId)
    notes.push(`Local state: ${localState ? 'found' : 'not found'}`)
  } catch (error) {
    notes.push('Failed to load local state')
  }

  try {
    if (config.remoteEnabled) {
      remoteState = await remoteBrainPersistence.load(sessionId)
      notes.push(`Remote state: ${remoteState ? 'found' : 'not found'}`)
    } else {
      notes.push('Remote persistence not enabled')
    }
  } catch (error) {
    notes.push('Failed to load remote state')
  }

  try {
    const snapshot = getLatestSnapshot(sessionId)
    snapshotState = snapshot?.state
    notes.push(`Latest snapshot: ${snapshotState ? 'found' : 'not found'}`)
  } catch (error) {
    notes.push('Failed to load snapshot')
  }

  // Check journal replay viability
  let journalViable = false
  try {
    journalViable = await isJournalReplayViable(sessionId)
    notes.push(`Journal replay: ${journalViable ? 'viable' : 'not viable'}`)
  } catch (error) {
    notes.push('Failed to check journal viability')
  }

  // Resolution logic
  if (!localState && !remoteState && !snapshotState) {
    // No state anywhere
    if (journalViable) {
      return {
        chosenSource: 'journal_replay',
        reason: 'No state found, attempting journal replay',
        notes,
      }
    } else {
      return {
        chosenSource: 'local',
        reason: 'No state found anywhere, will create new',
        notes,
      }
    }
  }

  // Simple case: Only one source has state
  if (localState && !remoteState && !snapshotState) {
    return {
      chosenSource: 'local',
      reason: 'Only local state available',
      notes,
    }
  }

  if (!localState && remoteState && !snapshotState) {
    return {
      chosenSource: 'remote',
      reason: 'Only remote state available',
      notes,
    }
  }

  if (!localState && !remoteState && snapshotState) {
    return {
      chosenSource: 'snapshot',
      reason: 'Only snapshot available',
      notes,
    }
  }

  // Complex case: Multiple sources have state
  // Use timestamp and turn count to decide

  const localTime = localState?.updatedAt ?? 0
  const remoteTime = remoteState?.updatedAt ?? 0
  const snapshotTime = snapshotState?.updatedAt ?? 0

  const localTurns = localState?.turnCount ?? 0
  const remoteTurns = remoteState?.turnCount ?? 0
  const snapshotTurns = snapshotState?.turnCount ?? 0

  notes.push(`Local: turn ${localTurns}, time ${localTime}`)
  notes.push(`Remote: turn ${remoteTurns}, time ${remoteTime}`)
  notes.push(`Snapshot: turn ${snapshotTurns}, time ${snapshotTime}`)

  // Explicit preference
  if (preferLocal && localState) {
    return {
      chosenSource: 'local',
      reason: 'Local preferred by configuration',
      notes,
    }
  }

  if (preferRemote && remoteState) {
    return {
      chosenSource: 'remote',
      reason: 'Remote preferred by configuration',
      notes,
    }
  }

  // Rule 1: If times are very close, prefer higher turn count
  const maxTime = Math.max(localTime, remoteTime, snapshotTime)
  const minTime = Math.min(
    localTime || Infinity,
    remoteTime || Infinity,
    snapshotTime || Infinity
  )

  if (maxTime - minTime < maxTimeDelta) {
    notes.push('Times are close, using turn count as tie-breaker')

    if (localTurns >= remoteTurns && localTurns >= snapshotTurns && localState) {
      return {
        chosenSource: 'local',
        reason: 'Local has highest turn count (times are close)',
        notes,
      }
    }

    if (remoteTurns >= localTurns && remoteTurns >= snapshotTurns && remoteState) {
      return {
        chosenSource: 'remote',
        reason: 'Remote has highest turn count (times are close)',
        notes,
      }
    }

    if (snapshotState) {
      return {
        chosenSource: 'snapshot',
        reason: 'Snapshot has highest turn count (times are close)',
        notes,
      }
    }
  }

  // Rule 2: Use most recent by timestamp
  if (remoteTime > localTime && remoteTime > snapshotTime && remoteState) {
    notes.push('Remote has most recent timestamp')
    return {
      chosenSource: 'remote',
      reason: 'Remote state is most recent',
      notes,
    }
  }

  if (localTime > remoteTime && localTime > snapshotTime && localState) {
    notes.push('Local has most recent timestamp')
    return {
      chosenSource: 'local',
      reason: 'Local state is most recent',
      notes,
    }
  }

  if (snapshotTime > localTime && snapshotTime > remoteTime && snapshotState) {
    notes.push('Snapshot has most recent timestamp')
    return {
      chosenSource: 'snapshot',
      reason: 'Snapshot is most recent',
      notes,
    }
  }

  // Fallback: Prefer local
  if (localState) {
    return {
      chosenSource: 'local',
      reason: 'Default to local state',
      notes,
    }
  }

  // Last resort: Use remote or snapshot
  if (remoteState) {
    return {
      chosenSource: 'remote',
      reason: 'Fallback to remote state',
      notes,
    }
  }

  if (snapshotState) {
    return {
      chosenSource: 'snapshot',
      reason: 'Fallback to snapshot',
      notes,
    }
  }

  // Should never reach here, but handle it
  return {
    chosenSource: 'journal_replay',
    reason: 'No viable source found, attempting journal replay',
    notes,
  }
}

/**
 * Load state based on conflict resolution
 * Resolves conflicts and returns the chosen state
 */
export const loadStateWithConflictResolution = async (
  sessionId: string,
  options?: Parameters<typeof resolveConflict>[1]
): Promise<{
  state: SessionBrainState | undefined
  resolution: ConflictResolutionResult
}> => {
  const resolution = await resolveConflict(sessionId, options)

  let state: SessionBrainState | undefined

  switch (resolution.chosenSource) {
    case 'local':
      state = await localBrainPersistence.load(sessionId)
      break

    case 'remote':
      state = await remoteBrainPersistence.load(sessionId)
      break

    case 'snapshot': {
      const snapshot = getLatestSnapshot(sessionId)
      state = snapshot?.state
      break
    }

    case 'journal_replay':
      // TODO: Phase M8: Implement actual journal replay
      // For now, return undefined
      state = undefined
      break
  }

  return {
    state,
    resolution,
  }
}

/**
 * Check if there is a conflict between sources
 * Returns true if multiple sources have different states
 */
export const hasConflict = async (
  sessionId: string,
  maxTimeDelta: number = 60 * 1000
): Promise<{
  hasConflict: boolean
  sources: string[]
  details: string[]
}> => {
  const config = getPersistenceConfig()
  const sources: string[] = []
  const details: string[] = []

  let localState: SessionBrainState | undefined
  let remoteState: SessionBrainState | undefined

  try {
    localState = await localBrainPersistence.load(sessionId)
    if (localState) {
      sources.push('local')
      details.push(`Local: turn ${localState.turnCount}, time ${localState.updatedAt}`)
    }
  } catch {
    // Ignore
  }

  try {
    if (config.remoteEnabled) {
      remoteState = await remoteBrainPersistence.load(sessionId)
      if (remoteState) {
        sources.push('remote')
        details.push(`Remote: turn ${remoteState.turnCount}, time ${remoteState.updatedAt}`)
      }
    }
  } catch {
    // Ignore
  }

  // Check if there's a meaningful difference
  if (localState && remoteState) {
    const localTime = localState.updatedAt ?? 0
    const remoteTime = remoteState.updatedAt ?? 0
    const timeDiff = Math.abs(localTime - remoteTime)
    const turnDiff = Math.abs(localState.turnCount - remoteState.turnCount)

    if (timeDiff > maxTimeDelta || turnDiff > 0) {
      return {
        hasConflict: true,
        sources,
        details,
      }
    }
  }

  return {
    hasConflict: false,
    sources,
    details,
  }
}
