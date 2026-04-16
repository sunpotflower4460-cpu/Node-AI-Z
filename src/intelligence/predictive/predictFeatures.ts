import type { ChunkFeature } from '../ingest/chunkTypes'
import type { PredictionState } from './types'

/**
 * How much predicted strength decays relative to the actual strength.
 * A value of 0.5 means "I expect roughly half the intensity next turn".
 */
const PREDICTION_DECAY = 0.5

/**
 * Minimum strength required for a feature to be included in the prediction.
 * Weak signals are too noisy to be worth predicting.
 */
const PREDICTION_STRENGTH_THRESHOLD = 0.3

/** Maximum number of features to predict (avoid noise from marginal features) */
const MAX_PREDICTED_FEATURES = 5

/**
 * Generate a PredictionState for the next turn from the current active features.
 *
 * Algorithm:
 *   1. Retain only features above PREDICTION_STRENGTH_THRESHOLD.
 *   2. Sort by strength descending, take top MAX_PREDICTED_FEATURES.
 *   3. Expected strength = actual × PREDICTION_DECAY (things tend to persist but weaken).
 *   4. Confidence = mean strength of predicted features × 0.8 (never reach 1.0 naively).
 *
 * This is intentionally simple: a persistence prior, not a learned generative model.
 * Future versions can refine this with pathway co-activation statistics.
 */
export const predictFeatures = (
  activeFeatures: ChunkFeature[],
  currentTurn: number,
): PredictionState => {
  const candidates = activeFeatures
    .filter((f) => f.strength >= PREDICTION_STRENGTH_THRESHOLD)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, MAX_PREDICTED_FEATURES)

  if (candidates.length === 0) {
    return {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 0,
      basedOnTurn: currentTurn,
    }
  }

  const expectedFeatureIds = candidates.map((f) => f.id)
  const expectedFeatureStrengths: Record<string, number> = {}
  for (const f of candidates) {
    expectedFeatureStrengths[f.id] = Math.max(0.1, f.strength * PREDICTION_DECAY)
  }

  const meanStrength = candidates.reduce((s, f) => s + f.strength, 0) / candidates.length
  const confidence = Math.min(1, meanStrength * 0.8)

  return {
    expectedFeatureIds,
    expectedFeatureStrengths,
    confidence,
    basedOnTurn: currentTurn,
  }
}
