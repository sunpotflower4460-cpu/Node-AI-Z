/**
 * Persistence Environment Configuration
 * Centralizes environment variables and settings for persistence
 *
 * Phase M7: Remote backend configuration
 */

import type { PersistenceMode } from '../brain/persistence/types'

/**
 * Persistence environment configuration
 */
export type PersistenceEnvConfig = {
  /** Persistence mode (local, remote, hybrid) */
  mode: PersistenceMode

  /** Whether remote persistence is enabled */
  remoteEnabled: boolean

  /** Supabase project URL */
  supabaseUrl?: string

  /** Supabase anonymous key */
  supabaseAnonKey?: string

  /** Snapshot interval (in turns) */
  snapshotInterval: number

  /** Whether journaling is enabled */
  journalEnabled: boolean

  /** Maximum journal entries to keep locally */
  maxJournalEntries: number

  /** Whether to log persistence operations */
  debug: boolean
}

/**
 * Default persistence configuration
 * Uses environment variables if available, otherwise falls back to local mode
 */
export const getDefaultPersistenceConfig = (): PersistenceEnvConfig => {
  // Check if we have Supabase configuration in environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Enable remote if we have Supabase config
  const remoteEnabled = !!(supabaseUrl && supabaseAnonKey)

  // Default to hybrid if remote is available, otherwise local
  const mode: PersistenceMode = remoteEnabled ? 'hybrid' : 'local'

  return {
    mode,
    remoteEnabled,
    supabaseUrl,
    supabaseAnonKey,
    snapshotInterval: 10, // Create snapshot every 10 turns
    journalEnabled: true,
    maxJournalEntries: 1000,
    debug: import.meta.env.DEV ?? false,
  }
}

/**
 * Get current persistence configuration
 * Can be overridden by localStorage settings
 */
export const getPersistenceConfig = (): PersistenceEnvConfig => {
  const defaultConfig = getDefaultPersistenceConfig()

  try {
    // Try to load from localStorage
    const stored = localStorage.getItem('nodeaiz:crystal:persistence-env')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultConfig, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load persistence config from localStorage:', error)
  }

  return defaultConfig
}

/**
 * Save persistence configuration to localStorage
 */
export const savePersistenceConfigToStorage = (config: Partial<PersistenceEnvConfig>): boolean => {
  try {
    const current = getPersistenceConfig()
    const updated = { ...current, ...config }
    localStorage.setItem('nodeaiz:crystal:persistence-env', JSON.stringify(updated))
    return true
  } catch (error) {
    console.warn('Failed to save persistence config to localStorage:', error)
    return false
  }
}

/**
 * Check if remote persistence is configured and available
 */
export const isRemoteAvailable = (): boolean => {
  const config = getPersistenceConfig()
  return config.remoteEnabled && !!(config.supabaseUrl && config.supabaseAnonKey)
}
