/**
 * Brain Persistence Types
 * Defines the interface for brain state persistence adapters.
 * Allows for multiple storage backends (local, Supabase, Firebase, etc.)
 *
 * Phase M6: Extended with snapshot, journal, and recovery infrastructure
 */

import type { SessionBrainState } from '../sessionBrainState'

/**
 * Persistence mode: local, remote, or hybrid
 */
export type PersistenceMode = 'local' | 'remote' | 'hybrid'

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

/**
 * Snapshot metadata for brain state snapshots
 * Captures key metrics at snapshot time for recovery decisions
 */
export type SnapshotMetadata = {
  /** Unique snapshot identifier */
  snapshotId: string
  /** Session identifier this snapshot belongs to */
  sessionId: string
  /** Timestamp when snapshot was created */
  createdAt: number
  /** Turn count at snapshot time */
  turnCount: number
  /** Afterglow value at snapshot time */
  afterglow: number
  /** Number of episodic traces */
  episodicCount: number
  /** Number of schema entries */
  schemaCount: number
  /** Number of mixed latent nodes */
  mixedNodeCount: number
  /** Where this snapshot is stored */
  storageTarget: 'local' | 'remote'
}

/**
 * Journal event types for tracking brain state changes
 */
export type JournalEventType =
  | 'brain_saved'
  | 'snapshot_created'
  | 'episodic_added'
  | 'schema_promoted'
  | 'schema_reinforced'
  | 'workspace_changed'
  | 'mixed_node_selected'
  | 'recovery_planned'

/**
 * Journal event for tracking brain state changes over time
 */
export type JournalEvent = {
  /** Unique event identifier */
  id: string
  /** Session identifier */
  sessionId: string
  /** Event type */
  type: JournalEventType
  /** Timestamp when event occurred */
  createdAt: number
  /** Turn count when event occurred */
  turnCount: number
  /** Event-specific payload data */
  payload: Record<string, unknown>
}

/**
 * Recovery source types
 */
export type RecoverySource = 'snapshot' | 'journal' | 'local' | 'remote'

/**
 * Recovery plan for restoring brain state
 * Describes the strategy for recovering from various sources
 */
export type RecoveryPlan = {
  /** Session to recover */
  sessionId: string
  /** Primary recovery source */
  primarySource: RecoverySource
  /** Fallback sources in priority order */
  fallbackSources: RecoverySource[]
  /** Target snapshot ID if recovering from snapshot */
  targetSnapshotId?: string
  /** Target turn count to recover to */
  targetTurnCount?: number
  /** Whether to apply journal events after snapshot */
  applyJournalEvents: boolean
  /** Maximum age of acceptable recovery (ms) */
  maxAge?: number
  /** Created at timestamp */
  createdAt: number
}
