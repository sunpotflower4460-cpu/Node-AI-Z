/**
 * Remote Brain Persistence
 * Real implementation for remote brain state persistence.
 * Enables cross-device synchronization and post-deletion recovery.
 *
 * Phase M7: Real remote backend implementation
 * - Supabase backend integration
 * - Multi-device synchronization
 * - Server-side snapshot storage
 * - Journal event persistence
 * - Mother Core Server connection foundation
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'
import { loadBrainState, saveBrainState, clearBrainState } from './backendClient'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Remote persistence adapter.
 *
 * Phase M7: Full implementation with Supabase backend
 *
 * Capabilities:
 * - Remote database storage (Supabase)
 * - Mother Core Server integration (foundation)
 * - Cross-device synchronization
 * - Post-deletion recovery
 * - Server-side snapshot rotation
 * - Distributed journal storage
 */
export const remoteBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from remote storage.
   *
   * Phase M7: Real implementation using Supabase
   */
  async load(sessionId: string): Promise<SessionBrainState | undefined> {
    const config = getPersistenceConfig()

    if (!config.remoteEnabled) {
      if (config.debug) {
        console.log('Remote persistence disabled, skipping load')
      }
      return undefined
    }

    try {
      const state = await loadBrainState(sessionId)

      if (config.debug && state) {
        console.log(`Loaded brain state from remote for session ${sessionId}`)
      }

      return state
    } catch (error) {
      console.warn('Failed to load brain state from remote:', error)
      return undefined
    }
  },

  /**
   * Saves brain state to remote storage.
   *
   * Phase M7: Real implementation using Supabase
   */
  async save(state: SessionBrainState): Promise<boolean> {
    const config = getPersistenceConfig()

    if (!config.remoteEnabled) {
      if (config.debug) {
        console.log('Remote persistence disabled, skipping save')
      }
      return false
    }

    try {
      const success = await saveBrainState(state)

      if (config.debug) {
        console.log(
          `Save brain state to remote for session ${state.sessionId}: ${success ? 'success' : 'failed'}`,
        )
      }

      return success
    } catch (error) {
      console.warn('Failed to save brain state to remote:', error)
      return false
    }
  },

  /**
   * Clears brain state from remote storage.
   *
   * Phase M7: Real implementation using Supabase
   */
  async clear(sessionId: string): Promise<boolean> {
    const config = getPersistenceConfig()

    if (!config.remoteEnabled) {
      if (config.debug) {
        console.log('Remote persistence disabled, skipping clear')
      }
      return false
    }

    try {
      const success = await clearBrainState(sessionId)

      if (config.debug) {
        console.log(
          `Clear brain state from remote for session ${sessionId}: ${success ? 'success' : 'failed'}`,
        )
      }

      return success
    } catch (error) {
      console.warn('Failed to clear brain state from remote:', error)
      return false
    }
  },
}
