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
 */

// Core types
export type {
  SessionBrainState,
  EpisodicBufferEntry,
  MicroSignalDimensions,
} from './sessionBrainState'

// State initialization and updates
export { createInitialBrainState } from './createInitialBrainState'
export { updateBrainState } from './updateBrainState'

// Derived metrics
export { deriveAfterglow } from './deriveAfterglow'
export { deriveRecentActivityAverage } from './deriveRecentActivityAverage'

// Persistence adapters
export type { BrainPersistenceAdapter } from './persistence/types'
export { localBrainPersistence } from './persistence/localBrainPersistence'
export { remoteBrainPersistence } from './persistence/remoteBrainPersistence'
