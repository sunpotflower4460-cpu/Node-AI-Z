/**
 * Session Brain State
 * Internal state that persists across turns within a session.
 * This enables temporal continuity in the crystallized thinking runtime.
 */

import type { TemporalFeatureState } from '../signal/temporalTypes'
import type { PredictionState } from '../predictive/types'

/**
 * Episodic buffer entry
 * Represents a segment of experience bounded by event boundaries
 */
export type EpisodicBufferEntry = {
  turn: number
  timestamp: number
  summary?: string
  /** Boundary score that created this segment */
  boundaryScore?: number
  /** Surprise magnitude at this segment */
  surpriseMagnitude?: number
}

/**
 * Workspace state (simplified for Phase 1)
 */
export type WorkspaceState = {
  activeItems: string[]
  capacity: number
}

/**
 * Interoceptive state (simplified for Phase 1)
 */
export type InteroceptiveState = {
  arousal: number // 0-1
  valence: number // -1 to 1
}

/**
 * Micro-signal dimensions tracking
 */
export type MicroSignalDimensions = {
  fieldTone: string
  activeCueCount: number
  fusedConfidence: number
}

/**
 * Session Brain State
 * Carries internal state across turns within a single session.
 */
export type SessionBrainState = {
  /** Unique session identifier */
  sessionId: string

  /** Current turn count (0-indexed) */
  turnCount: number

  /** Temporal feature states from previous turn */
  temporalStates: Map<string, TemporalFeatureState>

  /** Prediction state from previous turn */
  predictionState: PredictionState

  /** Afterglow: residual activation from previous turn (0-0.2) */
  afterglow: number

  /** Recent field intensity (0-1) */
  recentFieldIntensity: number

  /** Recent activity average (0-1) */
  recentActivityAverage: number

  /** Micro-signal dimensions from previous turn */
  microSignalDimensions: MicroSignalDimensions

  /** Episodic buffer (minimal for Phase 1) */
  episodicBuffer: EpisodicBufferEntry[]

  /** Workspace state (minimal for Phase 1) */
  workspace: WorkspaceState

  /** Interoceptive state (minimal for Phase 1) */
  interoception: InteroceptiveState
}
