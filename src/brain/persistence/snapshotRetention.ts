/**
 * Snapshot Retention
 * Manages snapshot retention policies and pruning
 *
 * Phase M8: Snapshot generation management
 */

import type { SnapshotCatalogEntry, SnapshotGeneration } from './types'
import { groupSnapshotsByGeneration, sortSnapshotsNewestFirst, removeFromCatalog } from './snapshotCatalog'
import { loadSnapshotLocal } from './snapshotManager'

/**
 * Retention policy for different snapshot generations
 */
export type RetentionPolicy = {
  safety: number          // Keep most recent N safety snapshots
  turn: number            // Keep most recent N turn snapshots
  manual: number          // Keep most recent N manual snapshots
  restore_checkpoint: number  // Keep most recent N restore checkpoints
}

/**
 * Default retention policy
 */
export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  safety: 5,
  turn: 10,
  manual: 20,
  restore_checkpoint: 5,
}

/**
 * Result of retention policy application
 */
export type RetentionResult = {
  kept: SnapshotCatalogEntry[]
  pruned: SnapshotCatalogEntry[]
  summary: {
    total: number
    kept: number
    pruned: number
    byGeneration: Record<SnapshotGeneration, { kept: number; pruned: number }>
  }
}

/**
 * Apply snapshot retention policy
 * Determines which snapshots should be kept and which should be pruned
 */
export const applySnapshotRetention = (
  entries: SnapshotCatalogEntry[],
  policy: RetentionPolicy = DEFAULT_RETENTION_POLICY
): RetentionResult => {
  const kept: SnapshotCatalogEntry[] = []
  const pruned: SnapshotCatalogEntry[] = []

  // Group by generation
  const grouped = groupSnapshotsByGeneration(entries)

  // Summary by generation
  const byGeneration: Record<SnapshotGeneration, { kept: number; pruned: number }> = {
    safety: { kept: 0, pruned: 0 },
    turn: { kept: 0, pruned: 0 },
    manual: { kept: 0, pruned: 0 },
    restore_checkpoint: { kept: 0, pruned: 0 },
  }

  // Process each generation
  for (const generation of Object.keys(grouped) as SnapshotGeneration[]) {
    const generationEntries = grouped[generation]
    const keepCount = policy[generation]

    // Sort newest first
    const sorted = sortSnapshotsNewestFirst(generationEntries)

    // Keep the most recent N
    const toKeep = sorted.slice(0, keepCount)
    const toPrune = sorted.slice(keepCount)

    kept.push(...toKeep)
    pruned.push(...toPrune)

    byGeneration[generation].kept = toKeep.length
    byGeneration[generation].pruned = toPrune.length
  }

  return {
    kept,
    pruned,
    summary: {
      total: entries.length,
      kept: kept.length,
      pruned: pruned.length,
      byGeneration,
    },
  }
}

/**
 * Prune snapshots for a session
 * Actually removes snapshots that exceed retention policy
 */
export const pruneSnapshots = async (
  sessionId: string,
  policy: RetentionPolicy = DEFAULT_RETENTION_POLICY
): Promise<RetentionResult> => {
  // Get catalog entries for session
  const { listSnapshotCatalog } = await import('./snapshotCatalog')
  const entries = await listSnapshotCatalog(sessionId)

  // Apply retention policy
  const result = applySnapshotRetention(entries, policy)

  // Remove pruned snapshots
  for (const entry of result.pruned) {
    await removeSnapshot(entry)
  }

  return result
}

/**
 * Get retention summary without pruning
 * Shows what would be kept/pruned without actually removing anything
 */
export const getRetentionSummary = (
  entries: SnapshotCatalogEntry[],
  policy: RetentionPolicy = DEFAULT_RETENTION_POLICY
): RetentionResult => {
  return applySnapshotRetention(entries, policy)
}

/**
 * Check if a snapshot should be protected from pruning
 * Manual snapshots with labels are always protected
 */
export const isProtectedSnapshot = (entry: SnapshotCatalogEntry): boolean => {
  // Manual snapshots with labels are protected
  if (entry.generation === 'manual' && entry.label) {
    return true
  }

  // Most recent safety snapshot is protected
  // (This is handled by retention policy, but we mark it explicitly)
  return false
}

/**
 * Create a custom retention policy
 */
export const createRetentionPolicy = (
  overrides: Partial<RetentionPolicy>
): RetentionPolicy => {
  return {
    ...DEFAULT_RETENTION_POLICY,
    ...overrides,
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Remove a snapshot from storage
 * Removes from both local storage and catalog
 */
const removeSnapshot = async (entry: SnapshotCatalogEntry): Promise<void> => {
  try {
    // Remove from local storage
    if (entry.storageTarget === 'local') {
      const SNAPSHOT_STORAGE_PREFIX = 'nodeaiz:crystal:snapshot:'
      const snapshotKey = `${SNAPSHOT_STORAGE_PREFIX}${entry.snapshotId}`
      localStorage.removeItem(snapshotKey)
    }

    // TODO: Phase M8: Remove from remote storage when implemented

    // Remove from catalog
    removeFromCatalog(entry.snapshotId)
  } catch (error) {
    console.warn(`Failed to remove snapshot ${entry.snapshotId}:`, error)
  }
}

/**
 * Calculate storage usage by generation
 */
export const calculateStorageUsage = (
  entries: SnapshotCatalogEntry[]
): Record<SnapshotGeneration, { count: number; totalSize: number }> => {
  const usage: Record<SnapshotGeneration, { count: number; totalSize: number }> = {
    safety: { count: 0, totalSize: 0 },
    turn: { count: 0, totalSize: 0 },
    manual: { count: 0, totalSize: 0 },
    restore_checkpoint: { count: 0, totalSize: 0 },
  }

  for (const entry of entries) {
    usage[entry.generation].count++
    usage[entry.generation].totalSize += entry.sizeHint ?? 0
  }

  return usage
}
