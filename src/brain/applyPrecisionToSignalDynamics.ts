/**
 * Apply Precision To Signal Dynamics
 *
 * Phase M2: Applies precision control to signal processing dynamics.
 *
 * This subtly adjusts:
 * - Cue reinforcement strength
 * - Inhibition gain
 * - Proto meaning foregrounding
 * - Learning gain for temporal updates
 *
 * Important: This does NOT rewrite signal logic; it only applies weights.
 */

import type { PrecisionControl, PrecisionInfluenceNote } from './precisionTypes'
import type { PrecisionWeightedPredictionError } from './applyPrecisionToPredictionError'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export type SignalDynamicsAdjustment = {
  /** Multiplier for cue reinforcement (0.5 - 2.0) */
  cueReinforcementGain: number

  /** Multiplier for inhibition strength (0.5 - 2.0) */
  inhibitionMultiplier: number

  /** Multiplier for proto meaning foregrounding (0.5 - 1.5) */
  meaningForegroundGain: number

  /** Multiplier for temporal learning updates (0.5 - 2.0) */
  temporalLearningGain: number

  /** Notes explaining adjustments */
  notes: PrecisionInfluenceNote[]
}

/**
 * Apply precision control to signal dynamics.
 *
 * @param precisionControl - Current precision control parameters
 * @param effectivePredictionError - Weighted prediction error
 */
export const applyPrecisionToSignalDynamics = (
  precisionControl: PrecisionControl,
  weightedError: PrecisionWeightedPredictionError,
): SignalDynamicsAdjustment => {
  const notes: PrecisionInfluenceNote[] = []

  // ===== Cue Reinforcement Gain =====
  // High bottom-up weight → amplify cue reinforcement
  // High effective error → amplify cues (unexpected signals deserve attention)
  let cueReinforcementGain = 1.0

  if (precisionControl.bottomUpWeight > 0.6) {
    const boost = (precisionControl.bottomUpWeight - 0.6) * 0.5
    cueReinforcementGain += boost
    notes.push({
      target: 'signal_gain',
      delta: boost,
      reason: `High bottom-up weight (${precisionControl.bottomUpWeight.toFixed(2)}) → amplify cues`,
    })
  }

  if (weightedError.effectivePredictionError > 0.5) {
    const errorBoost = (weightedError.effectivePredictionError - 0.5) * 0.3
    cueReinforcementGain += errorBoost
    notes.push({
      target: 'signal_gain',
      delta: errorBoost,
      reason: `High effective error (${weightedError.effectivePredictionError.toFixed(2)}) → amplify cues`,
    })
  }

  // ===== Inhibition Multiplier =====
  // Use precision control's inhibition gain directly
  const inhibitionMultiplier = precisionControl.inhibitionGain

  notes.push({
    target: 'inhibition_gain',
    delta: inhibitionMultiplier - 1.0,
    reason: `Precision inhibition gain: ${precisionControl.inhibitionGain.toFixed(2)}`,
  })

  // ===== Proto Meaning Foregrounding Gain =====
  // High learning rate + high bottom-up → foreground new meanings
  // High top-down → maintain existing meanings
  let meaningForegroundGain = 1.0

  if (precisionControl.learningRate > 0.6 && precisionControl.bottomUpWeight > 0.5) {
    const boost = (precisionControl.learningRate - 0.6) * 0.4
    meaningForegroundGain += boost
    notes.push({
      target: 'signal_gain',
      delta: boost,
      reason: `High learning rate (${precisionControl.learningRate.toFixed(2)}) → foreground new meanings`,
    })
  } else if (precisionControl.topDownWeight > 0.6) {
    const damping = (precisionControl.topDownWeight - 0.6) * 0.3
    meaningForegroundGain -= damping
    notes.push({
      target: 'signal_gain',
      delta: -damping,
      reason: `High top-down weight (${precisionControl.topDownWeight.toFixed(2)}) → maintain existing meanings`,
    })
  }

  // ===== Temporal Learning Gain =====
  // Use precision control's learning rate directly
  const temporalLearningGain = precisionControl.learningRate

  notes.push({
    target: 'learning_rate',
    delta: temporalLearningGain - 1.0,
    reason: `Precision learning rate: ${precisionControl.learningRate.toFixed(2)}`,
  })

  return {
    cueReinforcementGain: clamp(cueReinforcementGain, 0.5, 2.0),
    inhibitionMultiplier: clamp(inhibitionMultiplier, 0.5, 2.0),
    meaningForegroundGain: clamp(meaningForegroundGain, 0.5, 1.5),
    temporalLearningGain: clamp(temporalLearningGain, 0.5, 2.0),
    notes,
  }
}
