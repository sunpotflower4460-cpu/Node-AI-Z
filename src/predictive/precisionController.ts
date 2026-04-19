/**
 * Precision Controller
 *
 * Computes precision weights for prediction errors based on
 * sensory and model uncertainty.
 *
 * High sensory uncertainty → trust input less
 * High model uncertainty → trust predictions less
 * Both high → explore/hold
 * Sensory low + model high → update models
 */

import type {
  UncertaintyState,
  SensoryUncertaintyFactors,
  ModelUncertaintyFactors,
} from './uncertaintyTypes'
import type { ProtoMeaning } from '../meaning/types'
import type { PredictionState } from './types'
import type { StateVector } from '../types/nodeStudio'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/**
 * Compute sensory uncertainty from input analysis
 */
export const computeSensoryUncertainty = (
  sensoryMeanings: ProtoMeaning[],
  narrativeMeanings: ProtoMeaning[],
  stateVector: StateVector,
  inputLength: number,
): { uncertainty: number; factors: SensoryUncertaintyFactors } => {
  // Meaning ambiguity: many weak meanings vs few strong ones
  const allMeanings = [...sensoryMeanings, ...narrativeMeanings]
  const avgMeaningStrength = allMeanings.length > 0
    ? allMeanings.reduce((sum, m) => sum + m.strength, 0) / allMeanings.length
    : 0.5
  const meaningAmbiguity = 1.0 - avgMeaningStrength

  // Field incoherence: entropy and polarization (inverted)
  const entropy = stateVector.entropy ?? 0.5
  const polarization = stateVector.polarization ?? 0.5
  const fieldIncoherence = (entropy * 0.6 + (1 - polarization) * 0.4)

  // Input complexity: longer inputs are potentially more ambiguous
  const normalizedLength = Math.min(1.0, inputLength / 200)
  const inputComplexity = normalizedLength * 0.5 + 0.25 // 0.25-0.75 range

  // Overall sensory uncertainty
  const uncertainty = (
    meaningAmbiguity * 0.4 +
    fieldIncoherence * 0.4 +
    inputComplexity * 0.2
  )

  return {
    uncertainty: clamp(uncertainty, 0, 1),
    factors: {
      meaningAmbiguity,
      fieldIncoherence,
      inputComplexity,
    },
  }
}

/**
 * Compute model uncertainty from prediction state
 */
export const computeModelUncertainty = (
  predictionState: PredictionState | undefined,
  isNovelInput: boolean,
): { uncertainty: number; factors: ModelUncertaintyFactors } => {
  // Prediction weakness: inverse of prediction confidence
  const predictionConfidence = predictionState?.confidence ?? 0.5
  const predictionWeakness = 1.0 - predictionConfidence

  // Novelty: new/unexpected inputs increase model uncertainty
  const novelty = isNovelInput ? 0.7 : 0.3

  // Overall model uncertainty
  const uncertainty = (
    predictionWeakness * 0.6 +
    novelty * 0.4
  )

  return {
    uncertainty: clamp(uncertainty, 0, 1),
    factors: {
      predictionWeakness,
      novelty,
    },
  }
}

/**
 * Compute precision weight from uncertainties
 *
 * Precision weight determines how much to trust prediction errors:
 * - Both uncertainties low → high precision, trust errors strongly
 * - Both uncertainties high → low precision, reduce learning
 * - Sensory high, model low → reduce learning from noisy input
 * - Sensory low, model high → increase learning (good time to update)
 */
export const computePrecisionWeight = (
  sensoryUncertainty: number,
  modelUncertainty: number,
): number => {
  // Precision is inverse of combined uncertainty
  const combinedUncertainty = (sensoryUncertainty + modelUncertainty) / 2

  // When sensory is low and model is high, boost precision (good learning opportunity)
  const learningOpportunity = sensoryUncertainty < 0.3 && modelUncertainty > 0.5
  const boost = learningOpportunity ? 0.2 : 0.0

  const precision = 1.0 - combinedUncertainty + boost

  return clamp(precision, 0.1, 1.0)
}

/**
 * Compute adjusted learning rate from uncertainties
 */
export const computeLearningRate = (
  sensoryUncertainty: number,
  modelUncertainty: number,
  baseLearningRate = 1.0,
): number => {
  // High sensory uncertainty → reduce learning (noisy input)
  const sensoryFactor = 1.0 - (sensoryUncertainty * 0.5)

  // High model uncertainty with low sensory uncertainty → increase learning
  const modelFactor = modelUncertainty > 0.5 && sensoryUncertainty < 0.4
    ? 1.2
    : 1.0

  // Both high → strong reduction
  const overloadFactor = sensoryUncertainty > 0.6 && modelUncertainty > 0.6
    ? 0.5
    : 1.0

  const adjustedRate = baseLearningRate * sensoryFactor * modelFactor * overloadFactor

  return clamp(adjustedRate, 0.1, 2.0)
}

/**
 * Compute inhibition gain for overload protection
 */
export const computeInhibitionGain = (
  sensoryUncertainty: number,
  modelUncertainty: number,
): number => {
  // High uncertainty → increase inhibition to prevent overload
  const combinedUncertainty = (sensoryUncertainty + modelUncertainty) / 2

  const gain = 1.0 + (combinedUncertainty * 0.8)

  return clamp(gain, 0.5, 2.0)
}

/**
 * Build complete uncertainty state
 */
export const buildUncertaintyState = (
  sensoryUncertainty: number,
  modelUncertainty: number,
): UncertaintyState => {
  const precisionWeight = computePrecisionWeight(sensoryUncertainty, modelUncertainty)
  const learningRate = computeLearningRate(sensoryUncertainty, modelUncertainty)
  const inhibitionGain = computeInhibitionGain(sensoryUncertainty, modelUncertainty)

  return {
    sensoryUncertainty,
    modelUncertainty,
    precisionWeight,
    learningRate,
    inhibitionGain,
  }
}
