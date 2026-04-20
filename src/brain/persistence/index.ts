/**
 * Brain Persistence Module
 * Adapters for persisting SessionBrainState to various storage backends.
 *
 * Phase M1: Local persistence via localStorage
 * Phase M6: Remote/hybrid infrastructure, snapshot, journal, recovery
 */

// Core types
export type {
  BrainPersistenceAdapter,
  PersistenceMode,
  SnapshotMetadata,
  JournalEvent,
  JournalEventType,
  RecoveryPlan,
  RecoverySource,
} from './types'

// Persistence adapters
export { localBrainPersistence } from './localBrainPersistence'
export { remoteBrainPersistence } from './remoteBrainPersistence'
export { hybridBrainPersistence } from './hybridBrainPersistence'

// Configuration
export type { PersistenceConfig } from './persistenceConfig'
export {
  DEFAULT_PERSISTENCE_CONFIG,
  getPersistenceAdapter,
  loadPersistenceConfig,
  savePersistenceConfig,
} from './persistenceConfig'

// Snapshot management
export type { Snapshot } from './snapshotManager'
export {
  createSnapshotMetadata,
  shouldCreateSnapshot,
  createSnapshot,
  saveSnapshotLocal,
  loadSnapshotLocal,
  loadSnapshotMetadataList,
  getLatestSnapshot,
  pruneSnapshots,
} from './snapshotManager'

// Journal management
export {
  createJournalEvent,
  loadJournalEvents,
  appendJournalEvent,
  getSessionJournalEvents,
  getJournalEventsAfterTurn,
  pruneJournalEvents,
  clearSessionJournal,
  recordBrainSaved,
  recordSnapshotCreated,
  recordEpisodicAdded,
  recordSchemaPromoted,
  recordSchemaReinforced,
  recordWorkspaceChanged,
  recordMixedNodeSelected,
  recordRecoveryPlanned,
} from './journalWriter'

// Recovery planning
export {
  createRecoveryPlan,
  executeRecoveryPlan,
  isRecoveryNeeded,
  getRecoveryOptions,
} from './recoveryPlanner'
