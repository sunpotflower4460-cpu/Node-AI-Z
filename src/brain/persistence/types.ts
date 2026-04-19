/**
 * Brain Persistence Types
 * Defines the interface for brain state persistence adapters.
 * Allows for multiple storage backends (local, Supabase, Firebase, etc.)
 */

import type { SessionBrainState } from '../sessionBrainState'

/**
 * Brain Persistence Adapter Interface
 * Implement this interface to support different storage backends.
 */
export type BrainPersistenceAdapter = {
  /**
   * Loads brain state for a given session ID.
   * Returns undefined if no state exists.
   */
  load(sessionId: string): Promise<SessionBrainState | undefined>

  /**
   * Saves brain state.
   * Returns true if successful, false otherwise.
   */
  save(state: SessionBrainState): Promise<boolean>

  /**
   * Clears brain state for a given session ID.
   * Returns true if successful, false otherwise.
   */
  clear(sessionId: string): Promise<boolean>
}
