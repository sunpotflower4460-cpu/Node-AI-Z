/**
 * Apply Precision To Prediction Error
 *
 * Phase M2: Weights raw prediction errors using precision control.
 *
 * This creates "effective prediction error" that varies based on:
 * - Current precision control parameters
 * - Uncertainty state
 * - Bottom-up/top-down balance
 * - Novelty boost
 *
 * Key: Raw errors are preserved for Observe; effective errors drive learning.
 */

import type { PrecisionControl, UncertaintyState, PrecisionInfluenceNote } from './precisionTypes'
import type { PredictionModulationResult, SurpriseSignal } from '../predictive/types'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export type PrecisionWeightedPredictionError = {
  /** Raw prediction error magnitude (unweighted) */
  rawPredictionError: number

  /** Effective prediction error (weighted by precision) */
  effectivePredictionError: number

  /** Raw surprise signals (unweighted) */
  rawSurpriseSignals: SurpriseSignal[]

  /** Weighted surprise signals */
  weightedSurpriseSignals: SurpriseSignal[]

  /** Overall weighted surprise level */
  weightedSurprise: number

  /** Notes explaining precision weighting */
  notes: PrecisionInfluenceNote[]
}

/**
 * Apply precision control to prediction errors.
 *
 * @param predictionModulation - Raw prediction error results
 * @param precisionControl - Current precision control parameters
 * @param uncertaintyState - Current uncertainty state
 */
export const applyPrecisionToPredictionError = (
  predictionModulation: PredictionModulationResult | undefined,
  precisionControl: PrecisionControl,
  uncertaintyState: UncertaintyState,
): PrecisionWeightedPredictionError => {
  const notes: PrecisionInfluenceNote[] = []

  // If no prediction modulation, return zero errors
  if (!predictionModulation) {
    return {
      rawPredictionError: 0.0,
      effectivePredictionError: 0.0,
      rawSurpriseSignals: [],
      weightedSurpriseSignals: [],
      weightedSurprise: 0.0,
      notes: [
        {
          target: 'prediction_error',
          delta: 0.0,
          reason: 'No prediction modulation available',
        },
      ],
    }
  }

  const rawPredictionError = predictionModulation.overallSurprise
  const rawSurpriseSignals = predictionModulation.surpriseSignals

  // ===== Compute base precision weight =====
  // Bottom-up weight emphasizes sensory input (actual errors)
  // Top-down weight de-emphasizes errors (trust predictions)
  const baseWeight = (
    precisionControl.bottomUpWeight * 0.6 +
    (1.0 - precisionControl.topDownWeight) * 0.4
  )

  notes.push({
    target: 'prediction_error',
    delta: baseWeight - 0.5,
    reason: `Bottom-up: ${precisionControl.bottomUpWeight.toFixed(2)}, Top-down: ${precisionControl.topDownWeight.toFixed(2)}`,
  })

  // ===== Apply novelty boost to unexpected signals =====
  let noveltyWeight = 0.0
  if (uncertaintyState.novelty > 0.5 && precisionControl.noveltyBoost > 0.0) {
    noveltyWeight = precisionControl.noveltyBoost * uncertaintyState.novelty
    notes.push({
      target: 'prediction_error',
      delta: noveltyWeight,
      reason: `Novelty boost: ${precisionControl.noveltyBoost.toFixed(2)} × novelty ${uncertaintyState.novelty.toFixed(2)}`,
    })
  }

  // ===== Apply uncertainty bias =====
  // High uncertainty bias → amplify errors when uncertain
  let uncertaintyWeight = 0.0
  if (uncertaintyState.ambiguity > 0.5) {
    uncertaintyWeight = (
      precisionControl.uncertaintyBias *
      uncertaintyState.ambiguity *
      0.3
    )
    notes.push({
      target: 'prediction_error',
      delta: uncertaintyWeight,
      reason: `Uncertainty bias: ${precisionControl.uncertaintyBias.toFixed(2)} × ambiguity ${uncertaintyState.ambiguity.toFixed(2)}`,
    })
  }

  // ===== Apply safety bias =====
  // High safety bias → dampen errors (defensive processing)
  let safetyDamping = 0.0
  if (precisionControl.safetyBias > 0.6) {
    safetyDamping = (precisionControl.safetyBias - 0.6) * 0.5
    notes.push({
      target: 'prediction_error',
      delta: -safetyDamping,
      reason: `Safety bias: ${precisionControl.safetyBias.toFixed(2)} → dampen errors`,
    })
  }

  // ===== Compute final effective error weight =====
  const errorWeight = clamp(
    baseWeight + noveltyWeight + uncertaintyWeight - safetyDamping,
    0.1, // Never completely suppress errors
    2.0  // Allow up to 2x amplification
  )

  const effectivePredictionError = rawPredictionError * errorWeight

  // ===== Weight individual surprise signals =====
  const weightedSurpriseSignals: SurpriseSignal[] = rawSurpriseSignals.map((signal) => {
    let signalWeight = errorWeight

    // Apply extra novelty boost to "unexpected_present" signals
    if (
      signal.direction === 'unexpected_present' &&
      precisionControl.noveltyBoost > 0.0
    ) {
      signalWeight *= (1.0 + precisionControl.noveltyBoost * 0.5)
    }

    return {
      ...signal,
      magnitude: signal.magnitude * signalWeight,
    }
  })

  // Compute weighted overall surprise
  const weightedSurprise = weightedSurpriseSignals.length > 0
    ? weightedSurpriseSignals.reduce((sum, s) => sum + s.magnitude, 0) / weightedSurpriseSignals.length
    : 0.0

  return {
    rawPredictionError,
    effectivePredictionError: clamp(effectivePredictionError, 0.0, 1.0),
    rawSurpriseSignals,
    weightedSurpriseSignals,
    weightedSurprise: clamp(weightedSurprise, 0.0, 1.0),
    notes,
  }
}
