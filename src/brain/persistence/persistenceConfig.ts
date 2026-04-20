/**
 * Persistence Configuration
 * Configures local/remote/hybrid persistence modes
 *
 * Phase M6: Infrastructure for switching between persistence modes
 */

import type { PersistenceMode, BrainPersistenceAdapter } from './types'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'
import { hybridBrainPersistence } from './hybridBrainPersistence'

/**
 * Persistence configuration
 */
export type PersistenceConfig = {
  /** Current persistence mode */
  mode: PersistenceMode
  /** Whether snapshots are enabled */
  snapshotEnabled: boolean
  /** Snapshot interval (in turns) */
  snapshotInterval: number
  /** Whether journaling is enabled */
  journalEnabled: boolean
  /** Maximum journal entries to keep */
  maxJournalEntries: number
}

/**
 * Default persistence configuration
 * Phase M6: Starts with local mode, snapshots and journaling enabled
 */
export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  mode: 'local',
  snapshotEnabled: true,
  snapshotInterval: 10, // Create snapshot every 10 turns
  journalEnabled: true,
  maxJournalEntries: 1000,
}

/**
 * Get the appropriate persistence adapter for the current mode
 */
export const getPersistenceAdapter = (mode: PersistenceMode): BrainPersistenceAdapter => {
  switch (mode) {
    case 'local':
      return localBrainPersistence
    case 'remote':
      return remoteBrainPersistence
    case 'hybrid':
      return hybridBrainPersistence
    default:
      return localBrainPersistence
  }
}

/**
 * Storage key for persistence config in localStorage
 */
const CONFIG_STORAGE_KEY = 'nodeaiz:crystal:persistence-config'

/**
 * Load persistence config from localStorage
 */
export const loadPersistenceConfig = (): PersistenceConfig => {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PERSISTENCE_CONFIG
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to load persistence config:', error)
    return DEFAULT_PERSISTENCE_CONFIG
  }
}

/**
 * Save persistence config to localStorage
 */
export const savePersistenceConfig = (config: PersistenceConfig): boolean => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
    return true
  } catch (error) {
    console.warn('Failed to save persistence config:', error)
    return false
  }
}
