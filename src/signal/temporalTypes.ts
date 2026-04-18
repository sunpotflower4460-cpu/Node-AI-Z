/**
 * Integrated Signal Runtime v2.2 — Temporal Decay + Recurrent Self Loop types
 */

/**
 * Temporal state for a single feature across turns.
 * Kept for compatibility with the chunked node pipeline.
 */
export type TemporalFeatureState = {
  id: string
  strength: number
  lastFiredTurn: number
  decayRate: number // 0.05 – 0.25
  refractoryUntilTurn: number
}

/**
 * Temporal state for micro-cues in the dual-stream runtime.
 * Mirrors feature temporal state but is kept distinct for clarity.
 */
export type TemporalCueState = {
  id: string
  strength: number
  lastFiredTurn: number
  decayRate: number
  refractoryUntilTurn: number
}

/**
 * Result of a recurrent convergence loop.
 * Generic over the state type so it can be reused for features, cues, or other state.
 */
export type RecurrentLoopResult<T> = {
  /** How many loop iterations actually ran */
  iterations: number
  /** Whether the loop stopped due to convergence (true) or maxLoops cap (false) */
  converged: boolean
  /** State snapshots for each iteration (index 0 = initial, last = final) */
  states: T[]
  /** Human-readable notes for Observe / debug display */
  debugNotes: string[]
}
