import type { ChunkFeature } from '../signal/chunkTypes'
import type { PredictionState, PredictionError, PredictionErrorType } from './types'

/**
 * Error magnitude below which a prediction is considered "correct".
 * Avoids generating noise for small prediction misses.
 */
const CORRECT_TOLERANCE = 0.15

/**
 * Compute per-feature prediction errors by comparing a PredictionState
 * against the actual features that fired this turn.
 *
 * Returns one PredictionError per:
 *   - each predicted feature (may have fired, or not)
 *   - each actual feature that was not predicted ("unexpected_present")
 *
 * The caller (applyPredictionModulation) decides which errors to act on.
 */
export const computePredictionError = (
  predicted: PredictionState,
  actualFeatures: ChunkFeature[],
): PredictionError[] => {
  const errors: PredictionError[] = []
  const actualMap = new Map<string, number>(actualFeatures.map((f) => [f.id, f.strength]))

  // ── Evaluate predicted features ───────────────────────────────────────────
  for (const featureId of predicted.expectedFeatureIds) {
    const expected = predicted.expectedFeatureStrengths[featureId] ?? 0
    const actual = actualMap.get(featureId) ?? 0
    const error = Math.abs(expected - actual)

    let type: PredictionErrorType
    if (error <= CORRECT_TOLERANCE) {
      type = 'correct'
    } else if (actual === 0) {
      type = 'expected_absent'
    } else if (actual > expected) {
      type = 'strength_higher'
    } else {
      type = 'strength_lower'
    }

    errors.push({ featureId, expected, actual, error, type })
  }

  // ── Evaluate unexpected actuals ───────────────────────────────────────────
  const predictedSet = new Set(predicted.expectedFeatureIds)
  for (const f of actualFeatures) {
    if (!predictedSet.has(f.id)) {
      errors.push({
        featureId: f.id,
        expected: 0,
        actual: f.strength,
        error: f.strength,
        type: 'unexpected_present',
      })
    }
  }

  return errors
}
