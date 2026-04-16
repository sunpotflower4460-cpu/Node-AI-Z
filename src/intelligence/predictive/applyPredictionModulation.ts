import type { ChunkFeature } from '../ingest/chunkTypes'
import type { PredictionState, SurpriseSignal, PredictionModulationResult } from './types'
import { computePredictionError } from '../_drafts/predictive/computePredictionError'

/**
 * Fraction of surprise magnitude added as a strength boost to surprising features.
 * Kept small (0.08) so that modulation foregrounds, not overwrites.
 */
const SURPRISE_BOOST_FACTOR = 0.08

/**
 * Maximum additive boost to field intensity from surprise.
 * Prevents a single very surprising input from dominating the whole state.
 */
const MAX_FIELD_BOOST = 0.2

/**
 * Minimum error magnitude required to generate a SurpriseSignal.
 * Errors below this threshold are considered negligible.
 */
const SURPRISE_THRESHOLD = 0.2

/**
 * Apply prediction-error modulation to the current feature set.
 *
 * Algorithm:
 *   1. If no valid prior exists, return features unchanged.
 *   2. Compute per-feature PredictionErrors via computePredictionError.
 *   3. For each significant error (≥ SURPRISE_THRESHOLD):
 *      a. Emit a SurpriseSignal with magnitude = error × confidence.
 *      b. If the feature is present (not 'expected_absent'), boost its strength
 *         by a small fraction of its surprise magnitude (winner-takes-a-bit-more).
 *   4. Compute overallSurprise = mean surprise magnitude.
 *   5. Derive fieldIntensityBoost ∝ overallSurprise.
 *
 * Features with type 'expected_absent' are noted in debugNotes but not injected —
 * absent features stay absent; this is purely an observational signal.
 *
 * Features classified 'correct' are untouched.
 */
export const applyPredictionModulation = (
  features: ChunkFeature[],
  predicted: PredictionState,
): PredictionModulationResult => {
  // Short-circuit: no prior prediction available
  if (predicted.confidence === 0) {
    return {
      features,
      surpriseSignals: [],
      errors: [],
      overallSurprise: 0,
      fieldIntensityBoost: 0,
      debugNotes: ['Prediction modulation: no prior prediction — skipped'],
    }
  }

  const errors = computePredictionError(predicted, features)
  const debugNotes: string[] = []
  const surpriseSignals: SurpriseSignal[] = []

  // Build a mutable map for in-place strength adjustments
  const featureMap = new Map<string, ChunkFeature>(features.map((f) => [f.id, { ...f }]))

  for (const err of errors) {
    if (err.type === 'correct') continue
    if (err.error < SURPRISE_THRESHOLD) continue

    const magnitude = Math.min(1, err.error * predicted.confidence)

    const direction: SurpriseSignal['direction'] =
      err.type === 'unexpected_present'
        ? 'unexpected_present'
        : err.type === 'expected_absent'
          ? 'expected_absent'
          : err.actual > err.expected
            ? 'strength_higher'
            : 'strength_lower'

    surpriseSignals.push({ featureId: err.featureId, magnitude, direction })

    if (err.type !== 'expected_absent' && featureMap.has(err.featureId)) {
      const f = featureMap.get(err.featureId)!
      const boost = magnitude * SURPRISE_BOOST_FACTOR
      featureMap.set(err.featureId, {
        ...f,
        strength: Math.min(0.99, f.strength + boost),
      })
      debugNotes.push(
        `  Surprise boost: ${err.featureId} +${boost.toFixed(3)} (error=${err.error.toFixed(3)}, type=${err.type})`,
      )
    } else if (err.type === 'expected_absent') {
      debugNotes.push(
        `  Expected but absent: ${err.featureId} (expected=${err.expected.toFixed(3)})`,
      )
    }
  }

  const overallSurprise =
    surpriseSignals.length > 0
      ? Math.min(
          1,
          surpriseSignals.reduce((s, sig) => s + sig.magnitude, 0) / surpriseSignals.length,
        )
      : 0

  const fieldIntensityBoost = Math.min(MAX_FIELD_BOOST, overallSurprise * 0.3)

  if (surpriseSignals.length > 0) {
    debugNotes.unshift(
      `Prediction modulation: ${surpriseSignals.length} surprise signal(s), overallSurprise=${overallSurprise.toFixed(3)}, fieldBoost=${fieldIntensityBoost.toFixed(3)}`,
    )
  } else {
    debugNotes.push('Prediction modulation: no significant surprise signals')
  }

  return {
    features: [...featureMap.values()],
    surpriseSignals,
    errors,
    overallSurprise,
    fieldIntensityBoost,
    debugNotes,
  }
}
