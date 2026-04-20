/**
 * Hybrid Brain Persistence
 * Combines local and remote persistence for resilience
 *
 * Phase M7: Production-ready hybrid adapter
 * - Primary: Local storage (fast, reliable)
 * - Secondary: Remote storage (persistent, cross-device)
 * - Load strategy: Compare timestamps, prefer newer
 * - Save strategy: Save to both, track success/failure
 * - Graceful degradation on remote failure
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'
import type { SaveStatus } from './backendTypes'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Storage key for save status tracking
 */
const SAVE_STATUS_KEY = 'nodeaiz:crystal:save-status'

/**
 * Get last save status from localStorage
 */
export const getLastSaveStatus = (): SaveStatus => {
  try {
    const stored = localStorage.getItem(SAVE_STATUS_KEY)
    if (!stored) {
      return { localSuccess: false, remoteSuccess: false, errors: [] }
    }
    return JSON.parse(stored)
  } catch (error) {
    return { localSuccess: false, remoteSuccess: false, errors: [] }
  }
}

/**
 * Save status to localStorage
 */
const saveSaveStatus = (status: SaveStatus): void => {
  try {
    localStorage.setItem(SAVE_STATUS_KEY, JSON.stringify(status))
  } catch (error) {
    console.warn('Failed to save status:', error)
  }
}

/**
 * Hybrid persistence adapter.
 * Saves to both local and remote, loads from newest source.
 *
 * Strategy:
 * - save(): Write to local (synchronous), then attempt remote (async)
 * - load(): Try both, prefer newer based on updatedAt timestamp
 * - clear(): Clear both local and remote
 *
 * Phase M7: Production ready with real remote backend
 */
export const hybridBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from both local and remote, prefers newer.
   *
   * Phase M7: Compares updatedAt timestamps to select newest state
   */
  async load(sessionId: string): Promise<SessionBrainState | undefined> {
    const config = getPersistenceConfig()
    const errors: string[] = []

    let localState: SessionBrainState | undefined
    let remoteState: SessionBrainState | undefined

    // Try local first (fast)
    try {
      localState = await localBrainPersistence.load(sessionId)
      if (config.debug && localState) {
        console.log(`Hybrid: loaded local state (updated: ${localState.updatedAt ?? 'unknown'})`)
      }
    } catch (error) {
      const err = `Local load failed: ${error}`
      errors.push(err)
      console.warn('Hybrid persistence: local load failed:', error)
    }

    // Try remote (if enabled)
    if (config.remoteEnabled) {
      try {
        remoteState = await remoteBrainPersistence.load(sessionId)
        if (config.debug && remoteState) {
          console.log(`Hybrid: loaded remote state (updated: ${remoteState.updatedAt ?? 'unknown'})`)
        }
      } catch (error) {
        const err = `Remote load failed: ${error}`
        errors.push(err)
        console.warn('Hybrid persistence: remote load failed:', error)
      }
    }

    // If both exist, prefer newer based on updatedAt
    if (localState && remoteState) {
      const localTime = localState.updatedAt ?? 0
      const remoteTime = remoteState.updatedAt ?? 0

      if (remoteTime > localTime) {
        if (config.debug) {
          console.log('Hybrid: using remote state (newer)')
        }
        // Sync newer remote state to local
        await localBrainPersistence.save(remoteState).catch(() => {
          // Ignore sync failures
        })
        return remoteState
      } else {
        if (config.debug) {
          console.log('Hybrid: using local state (newer or equal)')
        }
        // Sync newer local state to remote
        if (config.remoteEnabled) {
          await remoteBrainPersistence.save(localState).catch(() => {
            // Ignore sync failures
          })
        }
        return localState
      }
    }

    // If only one exists, use it and sync to the other
    if (localState) {
      if (config.debug) {
        console.log('Hybrid: using local state (only source)')
      }
      // Sync to remote
      if (config.remoteEnabled) {
        await remoteBrainPersistence.save(localState).catch(() => {
          // Ignore sync failures
        })
      }
      return localState
    }

    if (remoteState) {
      if (config.debug) {
        console.log('Hybrid: using remote state (only source)')
      }
      // Sync to local
      await localBrainPersistence.save(remoteState).catch(() => {
        // Ignore sync failures
      })
      return remoteState
    }

    return undefined
  },

  /**
   * Saves brain state to both local and remote.
   * Local save is required; remote save is best-effort.
   *
   * Phase M7: Tracks success/failure and logs status
   */
  async save(state: SessionBrainState): Promise<boolean> {
    const config = getPersistenceConfig()
    const errors: string[] = []
    const saveTime = Date.now()

    // Update state with current timestamp
    const stateWithTimestamp = {
      ...state,
      updatedAt: saveTime,
    }

    let localSuccess = false
    let remoteSuccess = false

    // Save to local (primary, required)
    try {
      localSuccess = await localBrainPersistence.save(stateWithTimestamp)
      if (config.debug) {
        console.log(`Hybrid: local save ${localSuccess ? 'succeeded' : 'failed'}`)
      }
    } catch (error) {
      const err = `Local save failed: ${error}`
      errors.push(err)
      console.warn('Hybrid persistence: local save failed:', error)
    }

    // Save to remote (secondary, best-effort)
    if (config.remoteEnabled) {
      try {
        remoteSuccess = await remoteBrainPersistence.save(stateWithTimestamp)
        if (config.debug) {
          console.log(`Hybrid: remote save ${remoteSuccess ? 'succeeded' : 'failed'}`)
        }
      } catch (error) {
        const err = `Remote save failed: ${error}`
        errors.push(err)
        // Don't log as warning - remote failure is expected and graceful
        if (config.debug) {
          console.log('Hybrid persistence: remote save failed (graceful):', error)
        }
      }
    }

    // Save status for Observe UI
    const status: SaveStatus = {
      localSuccess,
      remoteSuccess,
      lastLocalSaveTime: localSuccess ? saveTime : undefined,
      lastRemoteSaveTime: remoteSuccess ? saveTime : undefined,
      errors,
    }
    saveSaveStatus(status)

    // Return true if local save succeeded (remote is optional)
    return localSuccess
  },

  /**
   * Clears brain state from both local and remote.
   *
   * Phase M7: Tracks partial failures
   */
  async clear(sessionId: string): Promise<boolean> {
    const config = getPersistenceConfig()
    const errors: string[] = []

    let localSuccess = false
    let remoteSuccess = false

    // Clear from local
    try {
      localSuccess = await localBrainPersistence.clear(sessionId)
      if (config.debug) {
        console.log(`Hybrid: local clear ${localSuccess ? 'succeeded' : 'failed'}`)
      }
    } catch (error) {
      const err = `Local clear failed: ${error}`
      errors.push(err)
      console.warn('Hybrid persistence: local clear failed:', error)
    }

    // Clear from remote (best-effort)
    if (config.remoteEnabled) {
      try {
        remoteSuccess = await remoteBrainPersistence.clear(sessionId)
        if (config.debug) {
          console.log(`Hybrid: remote clear ${remoteSuccess ? 'succeeded' : 'failed'}`)
        }
      } catch (error) {
        const err = `Remote clear failed: ${error}`
        errors.push(err)
        // Don't log as warning - remote failure is expected and graceful
        if (config.debug) {
          console.log('Hybrid persistence: remote clear failed (graceful):', error)
        }
      }
    }

    // Log any errors
    if (errors.length > 0 && config.debug) {
      console.log('Hybrid clear errors:', errors)
    }

    // Return true if local clear succeeded
    return localSuccess
  },
}
