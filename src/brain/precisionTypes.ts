/**
 * Precision Types
 *
 * Phase M2: Precision / Uncertainty control types.
 *
 * These types define how the crystallized thinking mode adjusts its sensitivity
 * to prediction errors based on internal state, interoception, and uncertainty.
 */

/**
 * Precision Control State
 *
 * Controls how strongly prediction errors and signals are weighted.
 * This allows the system to adjust its learning and attention based on
 * internal conditions (safety, overload, novelty, etc.)
 */
export type PrecisionControl = {
  /** Weight for bottom-up (sensory) signals (0.0 - 1.0) */
  bottomUpWeight: number

  /** Weight for top-down (predictive) signals (0.0 - 1.0) */
  topDownWeight: number

  /** Boost applied to novel/unexpected signals (0.0 - 1.0) */
  noveltyBoost: number

  /** Learning rate multiplier (0.0 - 1.0) */
  learningRate: number

  /** Inhibition gain multiplier (0.0 - 1.0) */
  inhibitionGain: number

  /** Bias toward exploring uncertainty (0.0 - 1.0) */
  uncertaintyBias: number

  /** Bias toward safe/defensive processing (0.0 - 1.0) */
  safetyBias: number
}

/**
 * Uncertainty State
 *
 * Represents the current level of uncertainty and ambiguity in the system.
 * Used as input to precision control calculations.
 */
export type UncertaintyState = {
  /** How expected vs unexpected the current situation is (0.0 - 1.0) */
  expectedness: number

  /** Level of novelty in current input (0.0 - 1.0) */
  novelty: number

  /** Ambiguity/conflict in interpretations (0.0 - 1.0) */
  ambiguity: number

  /** Estimated volatility of environment (0.0 - 1.0) */
  volatilityEstimate: number

  /** Drift in confidence over recent turns (0.0 - 1.0) */
  confidenceDrift: number
}

/**
 * Precision Influence Note
 *
 * Records why and how precision control affected a particular component.
 * Used for Observe visualization and debugging.
 */
export type PrecisionInfluenceNote = {
  /** What component was affected */
  target:
    | 'prediction_error'
    | 'signal_gain'
    | 'learning_rate'
    | 'inhibition_gain'
    | 'bottom_up'
    | 'top_down'

  /** Magnitude of the influence (-1.0 to 1.0) */
  delta: number

  /** Human-readable explanation */
  reason: string
}
