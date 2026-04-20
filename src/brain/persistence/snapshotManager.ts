/**
 * Snapshot Manager
 * Creates and manages brain state snapshots for recovery
 *
 * Phase M7: Remote snapshot management
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { SnapshotMetadata } from './types'
import { createSnapshot as createRemoteSnapshot, listSnapshots as listRemoteSnapshots } from './backendClient'
import { getPersistenceConfig } from '../../config/persistenceEnv'

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
    schemaCount: state.schemaMemory?.patterns.length ?? 0,
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

/**
 * Save snapshot to both local and remote storage (Phase M7)
 * Returns true if at least local save succeeded
 */
export const maybeCreateSnapshot = async (
  state: SessionBrainState,
  snapshotInterval: number,
): Promise<boolean> => {
  const config = getPersistenceConfig()

  // Check if we should create a snapshot
  if (!shouldCreateSnapshot(state.turnCount, snapshotInterval)) {
    return false
  }

  // Create snapshot with appropriate storage target
  const storageTarget = config.remoteEnabled ? 'remote' : 'local'
  const snapshot = createSnapshot(state, storageTarget)

  let localSuccess = false
  let remoteSuccess = false

  // Save to local
  try {
    localSuccess = saveSnapshotLocal(snapshot)
    if (config.debug) {
      console.log(`Snapshot local save: ${localSuccess ? 'success' : 'failed'}`)
    }
  } catch (error) {
    console.warn('Failed to save snapshot locally:', error)
  }

  // Save to remote if enabled
  if (config.remoteEnabled) {
    try {
      remoteSuccess = await createRemoteSnapshot(state, snapshot.metadata)
      if (config.debug) {
        console.log(`Snapshot remote save: ${remoteSuccess ? 'success' : 'failed'}`)
      }
    } catch (error) {
      console.warn('Failed to save snapshot remotely:', error)
    }
  }

  // Return true if at least local save succeeded
  return localSuccess
}

/**
 * List all snapshots for a session (Phase M7)
 * Combines local and remote snapshots
 */
export const listAllSnapshots = async (sessionId: string): Promise<SnapshotMetadata[]> => {
  const config = getPersistenceConfig()

  // Get local snapshots
  const localSnapshots = loadSnapshotMetadataList().filter(
    meta => meta.sessionId === sessionId
  )

  // Get remote snapshots if enabled
  let remoteSnapshots: SnapshotMetadata[] = []
  if (config.remoteEnabled) {
    try {
      remoteSnapshots = await listRemoteSnapshots(sessionId)
    } catch (error) {
      console.warn('Failed to list remote snapshots:', error)
    }
  }

  // Merge and deduplicate by snapshotId
  const allSnapshots = [...localSnapshots, ...remoteSnapshots]
  const uniqueSnapshots = new Map<string, SnapshotMetadata>()

  for (const snapshot of allSnapshots) {
    // Keep the one with the latest createdAt if duplicates
    const existing = uniqueSnapshots.get(snapshot.snapshotId)
    if (!existing || snapshot.createdAt > existing.createdAt) {
      uniqueSnapshots.set(snapshot.snapshotId, snapshot)
    }
  }

  // Sort by createdAt descending
  return Array.from(uniqueSnapshots.values()).sort((a, b) => b.createdAt - a.createdAt)
}
