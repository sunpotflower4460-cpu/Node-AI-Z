/**
 * Uncertainty Types
 *
 * Two-layer uncertainty model:
 * - Sensory uncertainty: how noisy/ambiguous the input is
 * - Model uncertainty: how confident the predictions are
 *
 * These are used for precision weighting of prediction errors.
 */

/**
 * Uncertainty state tracking both sensory and model uncertainty
 */
export type UncertaintyState = {
  /** Sensory uncertainty: input ambiguity/noise (0-1) */
  sensoryUncertainty: number
  /** Model uncertainty: prediction confidence (0-1) */
  modelUncertainty: number
  /** Precision weight for prediction errors (0-1) */
  precisionWeight: number
  /** Adjusted learning rate based on uncertainty (0-2) */
  learningRate: number
  /** Inhibition gain for overload protection (0.5-2) */
  inhibitionGain: number
}

/**
 * Factors contributing to sensory uncertainty
 */
export type SensoryUncertaintyFactors = {
  /** Ambiguity in detected meanings */
  meaningAmbiguity: number
  /** Field coherence (inverted - low coherence = high uncertainty) */
  fieldIncoherence: number
  /** Input complexity */
  inputComplexity: number
}

/**
 * Factors contributing to model uncertainty
 */
export type ModelUncertaintyFactors = {
  /** Prediction confidence (inverted) */
  predictionWeakness: number
  /** Prior experience with similar inputs */
  novelty: number
}
