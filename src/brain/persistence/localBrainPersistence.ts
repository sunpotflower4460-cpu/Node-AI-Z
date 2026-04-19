/**
 * Local Brain Persistence
 * localStorage-based implementation of BrainPersistenceAdapter.
 * Enables continuity across page reloads and app restarts (until app deletion).
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'
import { loadSessionBrainState, saveSessionBrainState, clearSessionBrainState } from '../../storage/sessionBrainStorage'

/**
 * Local persistence adapter using localStorage.
 * This adapter stores brain state in the browser's localStorage.
 *
 * Limitations:
 * - State is lost when the app is deleted/uninstalled
 * - Storage is limited to ~5-10MB depending on browser
 * - Not synchronized across devices
 *
 * For cross-device persistence and post-deletion recovery,
 * use a remote adapter (Supabase, Firebase, etc.)
 */
export const localBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from localStorage.
   * Note: sessionId is ignored since localStorage is session-agnostic.
   */
  async load(_sessionId: string): Promise<SessionBrainState | undefined> {
    return loadSessionBrainState()
  },

  /**
   * Saves brain state to localStorage.
   */
  async save(state: SessionBrainState): Promise<boolean> {
    return saveSessionBrainState(state)
  },

  /**
   * Clears brain state from localStorage.
   * Note: sessionId is ignored since localStorage is session-agnostic.
   */
  async clear(_sessionId: string): Promise<boolean> {
    return clearSessionBrainState()
  },
}
