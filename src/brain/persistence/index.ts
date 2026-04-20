/**
 * Brain Persistence Module
 * Adapters for persisting SessionBrainState to various storage backends.
 *
 * Phase M1: Local persistence via localStorage
 * Phase M6: Remote/hybrid infrastructure, snapshot, journal, recovery
 * Phase M8: Snapshot generation management, restore execution, multi-device
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
  // Phase M8 types
  SnapshotGeneration,
  SnapshotCatalogEntry,
  RestorePreview,
  RestoreExecutionResult,
  DeviceSessionRecord,
  ConflictResolutionResult,
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

// Phase M8: Snapshot catalog
export {
  listSnapshotCatalog,
  addSnapshotCatalogEntry,
  sortSnapshotsNewestFirst,
  groupSnapshotsByStorage,
  groupSnapshotsByGeneration,
  getLatestByGeneration,
  updateSnapshotLabel,
  removeFromCatalog,
} from './snapshotCatalog'

// Phase M8: Snapshot retention
export type { RetentionPolicy, RetentionResult } from './snapshotRetention'
export {
  DEFAULT_RETENTION_POLICY,
  applySnapshotRetention,
  pruneSnapshots as pruneSnapshotsWithPolicy,
  getRetentionSummary,
  isProtectedSnapshot,
  createRetentionPolicy,
  calculateStorageUsage,
} from './snapshotRetention'

// Phase M8: Restore preview
export {
  generateRestorePreview,
  previewRestoreFromLocalSnapshot,
  previewRestoreFromRemoteSnapshot,
  previewRestoreFromLatestLocal,
  previewRestoreFromLatestRemote,
} from './restorePreview'

// Phase M8: Restore executor
export {
  restoreFromSnapshot,
  restoreFromLatestRemote,
  restoreFromLatestLocal,
  createManualSnapshot,
} from './restoreExecutor'

// Phase M8: Journal replay
export type { JournalReplayCandidate } from './journalReplay'
export {
  getJournalReplayCandidates,
  getRecentJournalSummary,
  estimateJournalRecoverableRange,
  isJournalReplayViable,
  getJournalEventsInRange,
} from './journalReplay'

// Phase M8: Device session registry
export {
  registerDeviceSession,
  listDeviceSessions,
  updateDeviceSession,
  getMostRecentDeviceSession,
  getThisDeviceSession,
  isThisDevicePrimary,
  getDeviceSessionSummary,
  pruneOldDeviceSessions,
} from './deviceSessionRegistry'

// Phase M8: Conflict resolver
export {
  resolveConflict,
  loadStateWithConflictResolution,
  hasConflict,
} from './conflictResolver'
