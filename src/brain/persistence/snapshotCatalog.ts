/**
 * Snapshot Catalog
 * Manages snapshot catalog across local and remote storage
 *
 * Phase M8: Snapshot generation management
 */

import type { SnapshotCatalogEntry, SnapshotGeneration } from './types'
import { loadSnapshotMetadataList, listAllSnapshots } from './snapshotManager'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Storage key for snapshot catalog in localStorage
 */
const CATALOG_STORAGE_KEY = 'nodeaiz:crystal:snapshot-catalog'

/**
 * List snapshot catalog for a session
 * Combines local and remote snapshots with generation metadata
 */
export const listSnapshotCatalog = async (sessionId: string): Promise<SnapshotCatalogEntry[]> => {
  const config = getPersistenceConfig()

  // Get all snapshots (local + remote)
  let allSnapshots
  try {
    allSnapshots = await listAllSnapshots(sessionId)
  } catch {
    // Fall back to local only
    allSnapshots = loadSnapshotMetadataList().filter(meta => meta.sessionId === sessionId)
  }

  // Load catalog entries to get generation info
  const catalogMap = loadCatalogMap()

  // Convert to catalog entries
  const catalogEntries: SnapshotCatalogEntry[] = allSnapshots.map(snapshot => {
    const existingEntry = catalogMap.get(snapshot.snapshotId)

    return {
      snapshotId: snapshot.snapshotId,
      sessionId: snapshot.sessionId,
      createdAt: snapshot.createdAt,
      turnCount: snapshot.turnCount,
      generation: existingEntry?.generation ?? inferGenerationType(snapshot.snapshotId),
      storageTarget: snapshot.storageTarget,
      label: existingEntry?.label,
      sizeHint: existingEntry?.sizeHint,
    }
  })

  if (config.debug) {
    console.log(`Snapshot catalog for session ${sessionId}: ${catalogEntries.length} entries`)
  }

  return catalogEntries
}

/**
 * Add a snapshot catalog entry
 * Updates both the catalog and the underlying snapshot metadata
 */
export const addSnapshotCatalogEntry = (entry: SnapshotCatalogEntry): boolean => {
  try {
    const catalogMap = loadCatalogMap()
    catalogMap.set(entry.snapshotId, entry)
    saveCatalogMap(catalogMap)
    return true
  } catch (error) {
    console.warn('Failed to add snapshot catalog entry:', error)
    return false
  }
}

/**
 * Sort snapshots newest first
 */
export const sortSnapshotsNewestFirst = (
  entries: SnapshotCatalogEntry[]
): SnapshotCatalogEntry[] => {
  return [...entries].sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Group snapshots by storage target
 */
export const groupSnapshotsByStorage = (
  entries: SnapshotCatalogEntry[]
): {
  local: SnapshotCatalogEntry[]
  remote: SnapshotCatalogEntry[]
} => {
  const local: SnapshotCatalogEntry[] = []
  const remote: SnapshotCatalogEntry[] = []

  for (const entry of entries) {
    if (entry.storageTarget === 'local') {
      local.push(entry)
    } else {
      remote.push(entry)
    }
  }

  return { local, remote }
}

/**
 * Group snapshots by generation type
 */
export const groupSnapshotsByGeneration = (
  entries: SnapshotCatalogEntry[]
): Record<SnapshotGeneration, SnapshotCatalogEntry[]> => {
  const result: Record<SnapshotGeneration, SnapshotCatalogEntry[]> = {
    turn: [],
    manual: [],
    safety: [],
    restore_checkpoint: [],
  }

  for (const entry of entries) {
    result[entry.generation].push(entry)
  }

  return result
}

/**
 * Get the latest snapshot for each generation type
 */
export const getLatestByGeneration = (
  entries: SnapshotCatalogEntry[]
): Partial<Record<SnapshotGeneration, SnapshotCatalogEntry>> => {
  const result: Partial<Record<SnapshotGeneration, SnapshotCatalogEntry>> = {}

  for (const entry of sortSnapshotsNewestFirst(entries)) {
    if (!result[entry.generation]) {
      result[entry.generation] = entry
    }
  }

  return result
}

/**
 * Update catalog entry label
 */
export const updateSnapshotLabel = (
  snapshotId: string,
  label: string
): boolean => {
  try {
    const catalogMap = loadCatalogMap()
    const entry = catalogMap.get(snapshotId)

    if (!entry) {
      return false
    }

    entry.label = label
    catalogMap.set(snapshotId, entry)
    saveCatalogMap(catalogMap)
    return true
  } catch (error) {
    console.warn('Failed to update snapshot label:', error)
    return false
  }
}

/**
 * Remove snapshot from catalog
 */
export const removeFromCatalog = (snapshotId: string): boolean => {
  try {
    const catalogMap = loadCatalogMap()
    catalogMap.delete(snapshotId)
    saveCatalogMap(catalogMap)
    return true
  } catch (error) {
    console.warn('Failed to remove from catalog:', error)
    return false
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Load catalog map from localStorage
 */
const loadCatalogMap = (): Map<string, SnapshotCatalogEntry> => {
  try {
    const stored = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (!stored) {
      return new Map()
    }

    const entries: SnapshotCatalogEntry[] = JSON.parse(stored)
    return new Map(entries.map(entry => [entry.snapshotId, entry]))
  } catch (error) {
    console.warn('Failed to load catalog map:', error)
    return new Map()
  }
}

/**
 * Save catalog map to localStorage
 */
const saveCatalogMap = (catalogMap: Map<string, SnapshotCatalogEntry>): void => {
  try {
    const entries = Array.from(catalogMap.values())
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.warn('Failed to save catalog map:', error)
  }
}

/**
 * Infer generation type from snapshot ID
 * Fallback heuristic when catalog entry is missing
 */
const inferGenerationType = (snapshotId: string): SnapshotGeneration => {
  if (snapshotId.includes('safety')) {
    return 'safety'
  }
  if (snapshotId.includes('manual')) {
    return 'manual'
  }
  if (snapshotId.includes('checkpoint')) {
    return 'restore_checkpoint'
  }
  return 'turn'
}
