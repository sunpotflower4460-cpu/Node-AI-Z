export type {
  PredictionState,
  PredictionErrorType,
  PredictionError,
  SurpriseSignal,
  PredictionModulationResult,
} from './types'

export { buildEmptyPredictionState } from './buildPredictionState'
export { predictFeatures } from '../_drafts/predictive/predictFeatures'
export { computePredictionError } from '../_drafts/predictive/computePredictionError'
export { applyPredictionModulation } from './applyPredictionModulation'
export { updatePredictionState } from './updatePredictionState'
