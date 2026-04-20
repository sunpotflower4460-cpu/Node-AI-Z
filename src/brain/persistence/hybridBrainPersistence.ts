/**
 * Hybrid Brain Persistence
 * Combines local and remote persistence for resilience
 *
 * Phase M6: Hybrid adapter that saves to both local and remote
 * - Primary: Local storage (fast, reliable)
 * - Secondary: Remote storage (persistent, cross-device)
 * - Load strategy: Local first, remote fallback
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'

/**
 * Hybrid persistence adapter.
 * Saves to both local and remote, loads from local with remote fallback.
 *
 * Strategy:
 * - save(): Write to local (synchronous), then attempt remote (best-effort)
 * - load(): Try local first, fallback to remote if local fails
 * - clear(): Clear both local and remote
 *
 * Phase M6: Remote is stubbed but architecture is ready for implementation
 */
export const hybridBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from local storage first, falls back to remote.
   */
  async load(sessionId: string): Promise<SessionBrainState | undefined> {
    // Try local first (fast)
    try {
      const localState = await localBrainPersistence.load(sessionId)
      if (localState) {
        return localState
      }
    } catch (error) {
      console.warn('Hybrid persistence: local load failed:', error)
    }

    // Fallback to remote (if available)
    try {
      const remoteState = await remoteBrainPersistence.load(sessionId)
      if (remoteState) {
        // Restore to local for faster future access
        await localBrainPersistence.save(remoteState)
        return remoteState
      }
    } catch (error) {
      // Remote is stubbed in Phase M6, so this is expected
      console.warn('Hybrid persistence: remote load failed (expected in Phase M6):', error)
    }

    return undefined
  },

  /**
   * Saves brain state to both local and remote.
   * Local save is required; remote save is best-effort.
   */
  async save(state: SessionBrainState): Promise<boolean> {
    let localSuccess = false
    let remoteSuccess = false

    // Save to local (primary, required)
    try {
      localSuccess = await localBrainPersistence.save(state)
    } catch (error) {
      console.warn('Hybrid persistence: local save failed:', error)
    }

    // Save to remote (secondary, best-effort)
    try {
      remoteSuccess = await remoteBrainPersistence.save(state)
    } catch (error) {
      // Remote is stubbed in Phase M6, so this is expected
      // Don't log as warning since it's intentional
    }

    // Return true if local save succeeded (remote is optional)
    return localSuccess
  },

  /**
   * Clears brain state from both local and remote.
   */
  async clear(sessionId: string): Promise<boolean> {
    let localSuccess = false
    let remoteSuccess = false

    // Clear from local
    try {
      localSuccess = await localBrainPersistence.clear(sessionId)
    } catch (error) {
      console.warn('Hybrid persistence: local clear failed:', error)
    }

    // Clear from remote (best-effort)
    try {
      remoteSuccess = await remoteBrainPersistence.clear(sessionId)
    } catch (error) {
      // Remote is stubbed in Phase M6, so this is expected
    }

    // Return true if local clear succeeded
    return localSuccess
  },
}
