/**
 * Session Brain State
 * Internal state that persists across turns within a session.
 * This enables temporal continuity in the crystallized thinking runtime.
 */

import type { TemporalFeatureState } from '../signal/temporalTypes'
import type { PredictionState } from '../predictive/types'
import type { InteroceptiveState } from '../interoception/interoceptiveState'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { PrecisionControl, UncertaintyState, PrecisionInfluenceNote } from './precisionTypes'
import type { SchemaMemoryState, SchemaInfluenceNote, EpisodicTrace } from '../memory/types'
import type { MixedLatentNode, MixedNodeInfluenceNote } from '../node/mixedNodeTypes'

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

  /** Last updated timestamp (for hybrid persistence sync) */
  updatedAt?: number

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

  /** Episodic buffer (Phase 1: minimal event boundaries, Phase M4: full episodic traces) */
  episodicBuffer: EpisodicBufferEntry[]

  /** Phase M4: Episodic trace buffer (rich single-event memories) */
  episodicTraces?: EpisodicTrace[]

  /** Phase M4: Schema memory (recurring patterns consolidated from episodic traces) */
  schemaMemory?: SchemaMemoryState

  /** Phase M4: Schema influence notes (for Observe visualization) */
  schemaInfluenceNotes?: SchemaInfluenceNote[]

  /** Workspace state (Phase 3: full phase-based control) */
  workspace: WorkspaceState

  /** Interoceptive state (Phase 3: full regulation state) */
  interoception: InteroceptiveState

  /** Precision control state (Phase M2: precision/uncertainty control) */
  precisionControl?: PrecisionControl

  /** Uncertainty state (Phase M2: precision/uncertainty control) */
  uncertaintyState?: UncertaintyState

  /** Precision influence notes (Phase M2: for Observe visualization) */
  precisionNotes?: PrecisionInfluenceNote[]

  /** Phase M5: Mixed latent pool (session-local, max ~10 nodes) */
  mixedLatentPool?: MixedLatentNode[]

  /** Phase M5: Mixed node influence notes (for Observe visualization) */
  mixedNodeNotes?: MixedNodeInfluenceNote[]
}
