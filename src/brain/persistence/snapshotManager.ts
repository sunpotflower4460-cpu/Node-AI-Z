/**
 * Snapshot Manager
 * Creates and manages brain state snapshots for recovery
 *
 * Phase M6: Snapshot infrastructure for remote persistence
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { SnapshotMetadata } from './types'

/**
 * Generate a unique snapshot ID
 */
const generateSnapshotId = (sessionId: string, turnCount: number): string => {
  const timestamp = Date.now()
  return `snapshot-${sessionId}-t${turnCount}-${timestamp}`
}

/**
 * Create snapshot metadata from brain state
 */
export const createSnapshotMetadata = (
  state: SessionBrainState,
  storageTarget: 'local' | 'remote' = 'local',
): SnapshotMetadata => {
  const snapshotId = generateSnapshotId(state.sessionId, state.turnCount)

  return {
    snapshotId,
    sessionId: state.sessionId,
    createdAt: Date.now(),
    turnCount: state.turnCount,
    afterglow: state.afterglow,
    episodicCount: state.episodicTraces?.length ?? 0,
    schemaCount: Object.keys(state.schemaMemory?.schemas ?? {}).length,
    mixedNodeCount: state.mixedLatentPool?.length ?? 0,
    storageTarget,
  }
}

/**
 * Check if a snapshot should be created based on turn count
 */
export const shouldCreateSnapshot = (
  turnCount: number,
  snapshotInterval: number,
): boolean => {
  return turnCount > 0 && turnCount % snapshotInterval === 0
}

/**
 * Snapshot with its metadata
 */
export type Snapshot = {
  metadata: SnapshotMetadata
  state: SessionBrainState
}

/**
 * Create a snapshot from brain state
 */
export const createSnapshot = (
  state: SessionBrainState,
  storageTarget: 'local' | 'remote' = 'local',
): Snapshot => {
  const metadata = createSnapshotMetadata(state, storageTarget)

  return {
    metadata,
    state: { ...state }, // Create a copy to avoid mutations
  }
}

/**
 * Storage key for snapshots in localStorage
 */
const SNAPSHOT_STORAGE_PREFIX = 'nodeaiz:crystal:snapshot:'

/**
 * Storage key for snapshot metadata list
 */
const SNAPSHOT_META_KEY = 'nodeaiz:crystal:snapshot-metadata'

/**
 * Save snapshot to local storage
 * Returns true if successful
 */
export const saveSnapshotLocal = (snapshot: Snapshot): boolean => {
  try {
    // Save snapshot data
    const snapshotKey = `${SNAPSHOT_STORAGE_PREFIX}${snapshot.metadata.snapshotId}`
    localStorage.setItem(snapshotKey, JSON.stringify(snapshot))

    // Update metadata list
    const metadataList = loadSnapshotMetadataList()
    metadataList.push(snapshot.metadata)
    localStorage.setItem(SNAPSHOT_META_KEY, JSON.stringify(metadataList))

    return true
  } catch (error) {
    console.warn('Failed to save snapshot to local storage:', error)
    return false
  }
}

/**
 * Load snapshot from local storage
 */
export const loadSnapshotLocal = (snapshotId: string): Snapshot | undefined => {
  try {
    const snapshotKey = `${SNAPSHOT_STORAGE_PREFIX}${snapshotId}`
    const stored = localStorage.getItem(snapshotKey)
    if (!stored) {
      return undefined
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to load snapshot from local storage:', error)
    return undefined
  }
}

/**
 * Load all snapshot metadata
 */
export const loadSnapshotMetadataList = (): SnapshotMetadata[] => {
  try {
    const stored = localStorage.getItem(SNAPSHOT_META_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to load snapshot metadata list:', error)
    return []
  }
}

/**
 * Get the latest snapshot for a session
 */
export const getLatestSnapshot = (sessionId: string): Snapshot | undefined => {
  const metadataList = loadSnapshotMetadataList()
  const sessionSnapshots = metadataList
    .filter(meta => meta.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)

  if (sessionSnapshots.length === 0) {
    return undefined
  }

  return loadSnapshotLocal(sessionSnapshots[0].snapshotId)
}

/**
 * Clear old snapshots (keep only the most recent N)
 */
export const pruneSnapshots = (sessionId: string, keepCount: number = 5): void => {
  try {
    const metadataList = loadSnapshotMetadataList()
    const sessionSnapshots = metadataList
      .filter(meta => meta.sessionId === sessionId)
      .sort((a, b) => b.createdAt - a.createdAt)

    // Determine which snapshots to delete
    const toDelete = sessionSnapshots.slice(keepCount)

    // Delete old snapshots
    for (const meta of toDelete) {
      const snapshotKey = `${SNAPSHOT_STORAGE_PREFIX}${meta.snapshotId}`
      localStorage.removeItem(snapshotKey)
    }

    // Update metadata list (keep only recent snapshots)
    const remainingMeta = metadataList.filter(
      meta => meta.sessionId !== sessionId || !toDelete.some(d => d.snapshotId === meta.snapshotId)
    )
    localStorage.setItem(SNAPSHOT_META_KEY, JSON.stringify(remainingMeta))
  } catch (error) {
    console.warn('Failed to prune snapshots:', error)
  }
}
