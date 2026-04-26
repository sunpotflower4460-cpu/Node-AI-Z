/**
 * Signal Loop Types
 *
 * Implements Self-Loop and Boundary-Loop for Signal Mode.
 * These loops prevent the system from being "reset to blank slate" each turn.
 */

export type SignalBoundarySource =
  | 'external'
  | 'internal'
  | 'teacher'
  | 'future_mother'
  | 'future_aeterna'

/**
 * Self-Loop State
 *
 * Tracks internal resonance and carry-over from previous turn.
 * Prevents complete reset; recent activations influence next turn.
 */
export type SignalSelfLoopState = {
  /** Recent assembly IDs that fired in the last few turns */
  recentAssemblyIds: string[]
  /** Recent particle IDs that were highly active */
  recentActiveParticleIds: string[]
  /** Strength of self-echo (how much the previous state resonates into this turn) */
  selfEchoStrength: number
  /** Tendency to replay internal patterns (0-1) */
  replayTendency: number
  /** Baseline activation level carried over from previous turn */
  baselineActivation: number
  /** Internal rhythm / oscillation strength */
  internalRhythm: number
  /** When this state was last updated */
  lastUpdatedAt: number
}

/**
 * Boundary-Loop State
 *
 * Tracks the balance between external stimuli and internal dynamics.
 * Helps classify whether signals came from outside or inside.
 */
export type SignalBoundaryLoopState = {
  /** Balance of signal sources (what proportion came from each source) */
  sourceBalance: Record<SignalBoundarySource, number>
  /** Strength of boundary tension (conflict between internal/external) */
  boundaryTension: number
  /** Recent external stimuli strength */
  recentExternalStrength: number
  /** Recent internal replay strength */
  recentInternalStrength: number
  /** Recent teacher signal strength */
  recentTeacherStrength: number
  /** Prediction residue: difference between expected and actual activation */
  predictionResidue: number
  /** When this state was last updated */
  lastUpdatedAt: number
}

/**
 * Combined Signal Loop State
 */
export type SignalLoopState = {
  selfLoop: SignalSelfLoopState
  boundaryLoop: SignalBoundaryLoopState
}
