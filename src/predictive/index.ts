/**
 * Predictive layer.
 * Owns priors, surprise, and prediction-error modulation for the signal-centered route.
 */
export type {
  PredictionState,
  PredictionErrorType,
  PredictionError,
  SurpriseSignal,
  PredictionModulationResult,
} from './types'

export { buildEmptyPredictionState } from './buildPredictionState'
export { predictFeatures } from './predictFeatures'
export { computePredictionError } from './computePredictionError'
export { applyPredictionModulation } from './applyPredictionModulation'
export { updatePredictionState } from './updatePredictionState'
