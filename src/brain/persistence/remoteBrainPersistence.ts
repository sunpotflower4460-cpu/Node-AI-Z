/**
 * Remote Brain Persistence (Placeholder)
 * Future implementation for remote brain state persistence.
 * Enables cross-device synchronization and post-deletion recovery.
 *
 * Phase M1: Interface placeholder only
 * Future phases will implement:
 * - Supabase/Firebase backend integration
 * - Snapshot/journal mechanism
 * - Recovery from remote storage
 * - Multi-device synchronization
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'

/**
 * Remote persistence adapter (placeholder).
 *
 * This is a placeholder for future remote persistence implementation.
 * In Phase M1, this adapter is not functional and should not be used.
 *
 * Future capabilities:
 * - Remote database storage (Supabase, Firebase, etc.)
 * - Cross-device synchronization
 * - Post-deletion recovery
 * - Snapshot and journal mechanisms
 * - Offline-first with sync queue
 *
 * @throws Error if any method is called (not yet implemented)
 */
export const remoteBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from remote storage.
   *
   * @throws Error Not yet implemented in Phase M1
   */
  async load(_sessionId: string): Promise<SessionBrainState | undefined> {
    throw new Error('Remote brain persistence not yet implemented. Use localBrainPersistence for Phase M1.')
  },

  /**
   * Saves brain state to remote storage.
   *
   * @throws Error Not yet implemented in Phase M1
   */
  async save(_state: SessionBrainState): Promise<boolean> {
    throw new Error('Remote brain persistence not yet implemented. Use localBrainPersistence for Phase M1.')
  },

  /**
   * Clears brain state from remote storage.
   *
   * @throws Error Not yet implemented in Phase M1
   */
  async clear(_sessionId: string): Promise<boolean> {
    throw new Error('Remote brain persistence not yet implemented. Use localBrainPersistence for Phase M1.')
  },
}

/**
 * Future remote persistence implementation notes:
 *
 * 1. Backend Selection:
 *    - Consider Supabase for PostgreSQL + real-time subscriptions
 *    - Consider Firebase for NoSQL + built-in auth
 *    - Consider custom backend for full control
 *
 * 2. Data Model:
 *    - session_brain_states table with sessionId as primary key
 *    - Optional: separate tables for temporal_states, episodic_buffer
 *    - Consider compression for large states
 *
 * 3. Synchronization Strategy:
 *    - Optimistic updates with conflict resolution
 *    - Last-write-wins vs. operational transformation
 *    - Periodic background sync vs. real-time sync
 *
 * 4. Recovery Strategy:
 *    - Periodic snapshots (every N turns)
 *    - Journal of incremental updates
 *    - Replay mechanism for recovery
 *
 * 5. Security Considerations:
 *    - User authentication required
 *    - Row-level security policies
 *    - Encryption at rest and in transit
 *    - Rate limiting for API calls
 *
 * 6. Performance Optimization:
 *    - Debounce save operations
 *    - Differential updates (only changed fields)
 *    - Lazy loading for large episodic buffers
 *    - Cache frequently accessed states
 */
