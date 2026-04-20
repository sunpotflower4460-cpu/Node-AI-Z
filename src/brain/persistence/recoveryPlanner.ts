/**
 * Recovery Planner
 * Plans recovery strategy for brain state restoration
 *
 * Phase M6: Recovery infrastructure for remote persistence
 */

import type { RecoveryPlan, RecoverySource } from './types'
import { getLatestSnapshot, loadSnapshotMetadataList } from './snapshotManager'
import { getSessionJournalEvents } from './journalWriter'

/**
 * Create a recovery plan for a session
 */
export const createRecoveryPlan = (
  sessionId: string,
  options: {
    preferSnapshot?: boolean
    targetTurnCount?: number
    maxAge?: number
  } = {},
): RecoveryPlan => {
  const {
    preferSnapshot = true,
    targetTurnCount,
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
  } = options

  // Check for available snapshots
  const snapshots = loadSnapshotMetadataList()
    .filter(meta => meta.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)

  // Check for journal events
  const journalEvents = getSessionJournalEvents(sessionId)

  // Determine primary source based on availability
  let primarySource: RecoverySource
  let fallbackSources: RecoverySource[]
  let targetSnapshotId: string | undefined
  let applyJournalEvents = false

  if (preferSnapshot && snapshots.length > 0) {
    // Prefer snapshot recovery
    primarySource = 'snapshot'
    fallbackSources = ['local', 'journal']

    // Find the best snapshot (closest to target turn, or latest)
    if (targetTurnCount !== undefined) {
      const closestSnapshot = snapshots.reduce((best, current) => {
        const bestDiff = Math.abs(best.turnCount - targetTurnCount)
        const currentDiff = Math.abs(current.turnCount - targetTurnCount)
        return currentDiff < bestDiff ? current : best
      })
      targetSnapshotId = closestSnapshot.snapshotId
    } else {
      targetSnapshotId = snapshots[0].snapshotId
    }

    // Apply journal events if available and snapshot is older than target
    applyJournalEvents = journalEvents.length > 0
  } else if (journalEvents.length > 0) {
    // Use journal-based recovery
    primarySource = 'journal'
    fallbackSources = ['local', 'snapshot']
    applyJournalEvents = true
  } else {
    // Fall back to local storage
    primarySource = 'local'
    fallbackSources = ['snapshot', 'journal']
    applyJournalEvents = false
  }

  return {
    sessionId,
    primarySource,
    fallbackSources,
    targetSnapshotId,
    targetTurnCount,
    applyJournalEvents,
    maxAge,
    createdAt: Date.now(),
  }
}

/**
 * Execute a recovery plan
 * Returns the recovered state or undefined if recovery fails
 */
export const executeRecoveryPlan = async (
  plan: RecoveryPlan,
): Promise<import('../sessionBrainState').SessionBrainState | undefined> => {
  // Try primary source
  let state = await tryRecoverySource(plan, plan.primarySource)

  if (state) {
    return state
  }

  // Try fallback sources in order
  for (const source of plan.fallbackSources) {
    state = await tryRecoverySource(plan, source)
    if (state) {
      return state
    }
  }

  return undefined
}

/**
 * Try to recover from a specific source
 */
const tryRecoverySource = async (
  plan: RecoveryPlan,
  source: RecoverySource,
): Promise<import('../sessionBrainState').SessionBrainState | undefined> => {
  try {
    switch (source) {
      case 'snapshot': {
        if (!plan.targetSnapshotId) {
          return undefined
        }
        const snapshot = getLatestSnapshot(plan.sessionId)
        return snapshot?.state
      }

      case 'local': {
        // Load from local persistence (will be implemented by adapter)
        const { localBrainPersistence } = await import('./localBrainPersistence')
        return await localBrainPersistence.load(plan.sessionId)
      }

      case 'journal': {
        // Journal-based recovery not yet implemented
        // Would reconstruct state from journal events
        return undefined
      }

      case 'remote': {
        // Remote recovery not yet implemented
        return undefined
      }

      default:
        return undefined
    }
  } catch (error) {
    console.warn(`Failed to recover from ${source}:`, error)
    return undefined
  }
}

/**
 * Check if recovery is needed
 */
export const isRecoveryNeeded = (sessionId: string): boolean => {
  // Check if we have any snapshots or journal entries for this session
  const snapshots = loadSnapshotMetadataList().filter(
    meta => meta.sessionId === sessionId
  )
  const journalEvents = getSessionJournalEvents(sessionId)

  return snapshots.length > 0 || journalEvents.length > 0
}

/**
 * Get recovery options for a session
 */
export const getRecoveryOptions = (sessionId: string) => {
  const snapshots = loadSnapshotMetadataList()
    .filter(meta => meta.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const journalEvents = getSessionJournalEvents(sessionId)

  return {
    hasSnapshots: snapshots.length > 0,
    snapshotCount: snapshots.length,
    latestSnapshotTurn: snapshots[0]?.turnCount,
    latestSnapshotAge: snapshots[0] ? Date.now() - snapshots[0].createdAt : undefined,
    hasJournal: journalEvents.length > 0,
    journalEventCount: journalEvents.length,
    latestJournalTurn: journalEvents[journalEvents.length - 1]?.turnCount,
  }
}
