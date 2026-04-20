/**
 * Recovery Planner
 * Plans recovery strategy for brain state restoration
 *
 * Phase M7: Real data-based recovery planning
 */

import type { RecoveryPlan, RecoverySource } from './types'
import { getLatestSnapshot, loadSnapshotMetadataList, listAllSnapshots } from './snapshotManager'
import { getSessionJournalEvents, listAllJournalEvents } from './journalWriter'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Create a recovery plan for a session (Phase M7)
 * Uses real data from local and remote sources
 */
export const createRecoveryPlan = async (
  sessionId: string,
  options: {
    preferSnapshot?: boolean
    targetTurnCount?: number
    maxAge?: number
  } = {},
): Promise<RecoveryPlan> => {
  const {
    preferSnapshot = true,
    targetTurnCount,
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
  } = options

  const config = getPersistenceConfig()

  // Check for local and remote brain states
  let localBrainState
  let remoteBrainState
  try {
    localBrainState = await localBrainPersistence.load(sessionId)
  } catch (error) {
    // Ignore errors
  }
  try {
    if (config.remoteEnabled) {
      remoteBrainState = await remoteBrainPersistence.load(sessionId)
    }
  } catch (error) {
    // Ignore errors
  }

  // Check for available snapshots (local + remote)
  let snapshots
  try {
    snapshots = await listAllSnapshots(sessionId)
  } catch (error) {
    // Fall back to local only
    snapshots = loadSnapshotMetadataList()
      .filter(meta => meta.sessionId === sessionId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  // Check for journal events (local + remote)
  let journalEvents
  try {
    journalEvents = await listAllJournalEvents(sessionId)
  } catch (error) {
    // Fall back to local only
    journalEvents = getSessionJournalEvents(sessionId)
  }

  // Determine primary source based on availability and recency
  let primarySource: RecoverySource
  let fallbackSources: RecoverySource[]
  let targetSnapshotId: string | undefined
  let applyJournalEvents = false

  // Compare local and remote brain states by updatedAt
  const localTime = localBrainState?.updatedAt ?? 0
  const remoteTime = remoteBrainState?.updatedAt ?? 0
  const latestSnapshotTime = snapshots[0]?.createdAt ?? 0

  // Decision matrix:
  // 1. If remote brain state is newest, use it
  // 2. Else if local brain state is newest, use it
  // 3. Else if snapshots exist and preferred, use latest snapshot
  // 4. Else if journal events exist, use journal
  // 5. Else fall back to local

  if (remoteTime > localTime && remoteTime > latestSnapshotTime) {
    primarySource = 'remote'
    fallbackSources = ['local', 'snapshot', 'journal']
  } else if (localTime > remoteTime && localTime > latestSnapshotTime) {
    primarySource = 'local'
    fallbackSources = ['remote', 'snapshot', 'journal']
  } else if (preferSnapshot && snapshots.length > 0) {
    // Prefer snapshot recovery
    primarySource = 'snapshot'
    fallbackSources = ['local', 'remote', 'journal']

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
    fallbackSources = ['local', 'remote', 'snapshot']
    applyJournalEvents = true
  } else {
    // Fall back to local storage
    primarySource = 'local'
    fallbackSources = ['remote', 'snapshot', 'journal']
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
 * Get recovery options for a session (Phase M7)
 * Returns information about available recovery sources
 */
export const getRecoveryOptions = async (sessionId: string) => {
  // Get all snapshots (local + remote)
  let snapshots
  try {
    snapshots = await listAllSnapshots(sessionId)
  } catch (error) {
    // Fall back to local only
    snapshots = loadSnapshotMetadataList()
      .filter(meta => meta.sessionId === sessionId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  // Get all journal events (local + remote)
  let journalEvents
  try {
    journalEvents = await listAllJournalEvents(sessionId)
  } catch (error) {
    // Fall back to local only
    journalEvents = getSessionJournalEvents(sessionId)
  }

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
