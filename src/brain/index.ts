/**
 * Brain Module
 * Session brain state management for crystallized thinking continuity.
 *
 * Phase M1: Core brain state types and utilities
 * - SessionBrainState: Persistent state across turns
 * - createInitialBrainState: Initialize new session
 * - updateBrainState: Update state after each turn
 * - deriveAfterglow: Calculate residual activation
 * - deriveRecentActivityAverage: Calculate activity metrics
 *
 * Phase M2: Precision / Uncertainty control
 * - PrecisionControl: How to weight prediction errors
 * - UncertaintyState: Current uncertainty estimates
 * - deriveUncertaintyState: Compute uncertainty from signals
 * - derivePrecisionControl: Compute precision from interoception + uncertainty
 * - applyPrecisionToPredictionError: Weight raw errors
 * - applyPrecisionToSignalDynamics: Adjust signal processing
 *
 * Phase M3: Workspace Gate
 * - WorkspaceGate: Control what gets held, updated, shielded, or flushed
 * - deriveWorkspaceCandidates: Extract candidates from signals
 * - scoreWorkspaceSalience: Update item salience scores
 * - mergeWorkspaceItems: Merge candidates with held items
 * - updateWorkspaceState: Apply gate results to workspace state
 */

// Core types
export type {
  SessionBrainState,
  EpisodicBufferEntry,
  MicroSignalDimensions,
} from './sessionBrainState'

// Phase M2: Precision types
export type {
  PrecisionControl,
  UncertaintyState,
  PrecisionInfluenceNote,
} from './precisionTypes'

// State initialization and updates
export { createInitialBrainState } from './createInitialBrainState'
export { updateBrainState } from './updateBrainState'

// Derived metrics
export { deriveAfterglow } from './deriveAfterglow'
export { deriveRecentActivityAverage } from './deriveRecentActivityAverage'

// Phase M2: Precision control
export { deriveUncertaintyState } from './deriveUncertaintyState'
export { derivePrecisionControl } from './precisionController'
export type { PrecisionControlInput, PrecisionControlResult } from './precisionController'
export { applyPrecisionToPredictionError } from './applyPrecisionToPredictionError'
export type { PrecisionWeightedPredictionError } from './applyPrecisionToPredictionError'
export { applyPrecisionToSignalDynamics } from './applyPrecisionToSignalDynamics'
export type { SignalDynamicsAdjustment } from './applyPrecisionToSignalDynamics'

// Persistence adapters
export type { BrainPersistenceAdapter } from './persistence/types'
export { localBrainPersistence } from './persistence/localBrainPersistence'
export { remoteBrainPersistence } from './persistence/remoteBrainPersistence'

// Phase M3: Workspace Gate
export type {
  WorkspaceItem,
  WorkspaceSource,
  WorkspaceGateAction,
  WorkspaceGateDecision,
  WorkspaceGateResult,
  WorkspaceGateConfig,
  WorkspaceCandidateInput,
} from './workspaceTypes'
export { DEFAULT_WORKSPACE_GATE_CONFIG } from './workspaceTypes'
export { deriveWorkspaceCandidates } from './deriveWorkspaceCandidates'
export { scoreWorkspaceSalience, scoreAllWorkspaceItems } from './scoreWorkspaceSalience'
export type { SalienceUpdateFactors } from './scoreWorkspaceSalience'
export { mergeWorkspaceItems } from './mergeWorkspaceItems'
export { applyWorkspaceGate } from './workspaceGate'
export type { WorkspaceGateInput } from './workspaceGate'
export { updateWorkspaceState } from './updateWorkspaceState'
