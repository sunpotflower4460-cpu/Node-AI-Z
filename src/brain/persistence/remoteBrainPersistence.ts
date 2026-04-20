/**
 * Remote Brain Persistence (Stub)
 * Future implementation for remote brain state persistence.
 * Enables cross-device synchronization and post-deletion recovery.
 *
 * Phase M6: Stub implementation with infrastructure ready
 * - Interface is defined and integrated
 * - Snapshot/journal mechanisms are in place
 * - Adapter switching works
 * - Backend integration is deferred to future phases
 *
 * Future implementation will add:
 * - Supabase/Firebase backend integration
 * - Multi-device synchronization
 * - Server-side snapshot storage
 * - Journal event persistence
 * - Mother Core Server connection
 */

import type { BrainPersistenceAdapter } from './types'
import type { SessionBrainState } from '../sessionBrainState'

/**
 * Remote persistence adapter (stub).
 *
 * Phase M6: This is a stub that returns gracefully without throwing errors.
 * The infrastructure for remote persistence is in place (snapshots, journal, recovery),
 * but the actual backend integration is deferred to future phases.
 *
 * Future capabilities:
 * - Remote database storage (Supabase, Firebase, etc.)
 * - Mother Core Server integration
 * - Cross-device synchronization
 * - Post-deletion recovery
 * - Server-side snapshot rotation
 * - Distributed journal storage
 *
 * Current behavior:
 * - load(): Returns undefined (no remote data available)
 * - save(): Returns false (remote not configured)
 * - clear(): Returns false (remote not configured)
 */
export const remoteBrainPersistence: BrainPersistenceAdapter = {
  /**
   * Loads brain state from remote storage.
   *
   * Phase M6: Stub returns undefined (no remote backend yet)
   */
  async load(_sessionId: string): Promise<SessionBrainState | undefined> {
    // Stub: Remote backend not yet implemented
    // Return undefined to indicate no remote data available
    return undefined
  },

  /**
   * Saves brain state to remote storage.
   *
   * Phase M6: Stub returns false (no remote backend yet)
   */
  async save(_state: SessionBrainState): Promise<boolean> {
    // Stub: Remote backend not yet implemented
    // Return false to indicate save not successful
    return false
  },

  /**
   * Clears brain state from remote storage.
   *
   * Phase M6: Stub returns false (no remote backend yet)
   */
  async clear(_sessionId: string): Promise<boolean> {
    // Stub: Remote backend not yet implemented
    // Return false to indicate clear not successful
    return false
  },
}
