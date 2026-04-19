/**
 * Precision Controller
 *
 * Phase M2: Derives PrecisionControl from SessionBrainState and UncertaintyState.
 *
 * This is the core of the "living organism" precision weighting:
 * - Same prediction error gets different treatment based on internal state
 * - Interoception (safety, overload, energy) affects precision
 * - Uncertainty and novelty modulate bottom-up/top-down balance
 * - Learning rate and inhibition gain adapt to conditions
 */

import type { PrecisionControl, UncertaintyState, PrecisionInfluenceNote } from './precisionTypes'
import type { InteroceptiveState } from '../interoception/interoceptiveState'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export type PrecisionControlInput = {
  interoception: InteroceptiveState
  uncertaintyState: UncertaintyState
  afterglow: number
  recentActivityAverage: number
  recentFieldIntensity: number
  previousPrecisionControl?: PrecisionControl
}

export type PrecisionControlResult = {
  precisionControl: PrecisionControl
  notes: PrecisionInfluenceNote[]
}

/**
 * Derives precision control parameters from internal state and uncertainty.
 *
 * Key principles:
 * - High safety + low overload → increase learning, top-down weight
 * - High novelty + surprise → increase bottom-up weight, novelty boost
 * - High overload → increase inhibition, decrease learning
 * - Low safety + high uncertainty → defensive, cautious processing
 */
export const derivePrecisionControl = ({
  interoception,
  uncertaintyState,
  afterglow,
  recentActivityAverage,
  // recentFieldIntensity, // Reserved for future use
  previousPrecisionControl,
}: PrecisionControlInput): PrecisionControlResult => {
  const notes: PrecisionInfluenceNote[] = []

  // ===== Base values (neutral) =====
  let bottomUpWeight = 0.5
  let topDownWeight = 0.5
  let noveltyBoost = 0.0
  let learningRate = 1.0
  let inhibitionGain = 1.0
  let uncertaintyBias = 0.5
  let safetyBias = 0.5

  // ===== Rule 1: Safe + Low Overload → Enhance Learning =====
  if (interoception.socialSafety > 0.6 && interoception.overload < 0.4) {
    // Increase top-down weight (trust predictions more in safe conditions)
    topDownWeight += 0.2
    notes.push({
      target: 'top_down',
      delta: 0.2,
      reason: 'High safety & low overload → trust predictions more',
    })

    // Increase learning rate (safe to learn)
    learningRate += 0.3
    notes.push({
      target: 'learning_rate',
      delta: 0.3,
      reason: 'High safety & low overload → increase learning',
    })

    // Decrease inhibition (less defensive)
    inhibitionGain -= 0.2
    notes.push({
      target: 'inhibition_gain',
      delta: -0.2,
      reason: 'High safety & low overload → reduce inhibition',
    })
  }

  // ===== Rule 2: High Novelty + Surprise → Bottom-Up Dominance =====
  if (uncertaintyState.novelty > 0.6 && uncertaintyState.expectedness < 0.4) {
    // Increase bottom-up weight (trust sensory input over predictions)
    bottomUpWeight += 0.3
    notes.push({
      target: 'bottom_up',
      delta: 0.3,
      reason: 'High novelty & low expectedness → trust sensory input',
    })

    // Increase novelty boost
    noveltyBoost += 0.4
    notes.push({
      target: 'prediction_error',
      delta: 0.4,
      reason: 'High novelty → boost unexpected signals',
    })

    // Moderately increase learning (novel situations are learning opportunities)
    learningRate += 0.2
    notes.push({
      target: 'learning_rate',
      delta: 0.2,
      reason: 'High novelty → moderate learning increase',
    })
  }

  // ===== Rule 3: High Overload → Defensive Mode =====
  if (interoception.overload > 0.6 || interoception.recoveryPressure > 0.6) {
    // Increase inhibition (protect from overload)
    inhibitionGain += 0.5
    notes.push({
      target: 'inhibition_gain',
      delta: 0.5,
      reason: 'High overload/recovery pressure → increase inhibition',
    })

    // Decrease learning rate (not safe to update models)
    learningRate -= 0.4
    notes.push({
      target: 'learning_rate',
      delta: -0.4,
      reason: 'High overload/recovery pressure → reduce learning',
    })

    // Slightly reduce bottom-up weight (reduce sensory flooding)
    bottomUpWeight -= 0.2
    notes.push({
      target: 'bottom_up',
      delta: -0.2,
      reason: 'High overload → reduce sensory sensitivity',
    })
  }

  // ===== Rule 4: High Ambiguity + Low Safety → Cautious Processing =====
  if (uncertaintyState.ambiguity > 0.6 && interoception.socialSafety < 0.4) {
    // Maintain bottom-up but don't over-commit to learning
    bottomUpWeight += 0.1
    notes.push({
      target: 'bottom_up',
      delta: 0.1,
      reason: 'High ambiguity & low safety → cautious sensory processing',
    })

    // Limit learning rate (uncertain about what to learn)
    learningRate -= 0.2
    notes.push({
      target: 'learning_rate',
      delta: -0.2,
      reason: 'High ambiguity & low safety → cautious learning',
    })

    // Increase inhibition (defensive stance)
    inhibitionGain += 0.3
    notes.push({
      target: 'inhibition_gain',
      delta: 0.3,
      reason: 'High ambiguity & low safety → defensive inhibition',
    })

    // Increase safety bias
    safetyBias += 0.3
  }

  // ===== Rule 5: High Arousal + Novelty Hunger → Exploration Mode =====
  if (interoception.arousal > 0.6 && interoception.noveltyHunger > 0.6) {
    // Increase bottom-up sensitivity
    bottomUpWeight += 0.2
    notes.push({
      target: 'bottom_up',
      delta: 0.2,
      reason: 'High arousal & novelty hunger → explore sensory input',
    })

    // Increase novelty boost
    noveltyBoost += 0.3
    notes.push({
      target: 'prediction_error',
      delta: 0.3,
      reason: 'High novelty hunger → boost unexpected signals',
    })

    // Increase uncertainty bias (tolerate ambiguity)
    uncertaintyBias += 0.3
  }

  // ===== Rule 6: High Volatility → Adaptive Caution =====
  if (uncertaintyState.volatilityEstimate > 0.6) {
    // Increase inhibition (environment is unpredictable)
    inhibitionGain += 0.2
    notes.push({
      target: 'inhibition_gain',
      delta: 0.2,
      reason: 'High volatility → increase inhibition for stability',
    })

    // Moderate learning rate (environment may change again)
    learningRate -= 0.1
    notes.push({
      target: 'learning_rate',
      delta: -0.1,
      reason: 'High volatility → moderate learning rate',
    })
  }

  // ===== Rule 7: Afterglow + Recent Activity → Continuity Bias =====
  if (afterglow > 0.1 && recentActivityAverage > 0.6) {
    // Slightly increase top-down (maintain continuity)
    topDownWeight += 0.15
    notes.push({
      target: 'top_down',
      delta: 0.15,
      reason: 'Afterglow + high activity → maintain continuity',
    })
  }

  // ===== Blend with previous precision control (70% new, 30% old) =====
  if (previousPrecisionControl) {
    bottomUpWeight = (bottomUpWeight * 0.7) + (previousPrecisionControl.bottomUpWeight * 0.3)
    topDownWeight = (topDownWeight * 0.7) + (previousPrecisionControl.topDownWeight * 0.3)
    noveltyBoost = (noveltyBoost * 0.7) + (previousPrecisionControl.noveltyBoost * 0.3)
    learningRate = (learningRate * 0.7) + (previousPrecisionControl.learningRate * 0.3)
    inhibitionGain = (inhibitionGain * 0.7) + (previousPrecisionControl.inhibitionGain * 0.3)
    uncertaintyBias = (uncertaintyBias * 0.7) + (previousPrecisionControl.uncertaintyBias * 0.3)
    safetyBias = (safetyBias * 0.7) + (previousPrecisionControl.safetyBias * 0.3)
  }

  // ===== Clamp all values to valid ranges =====
  const precisionControl: PrecisionControl = {
    bottomUpWeight: clamp(bottomUpWeight, 0.0, 1.0),
    topDownWeight: clamp(topDownWeight, 0.0, 1.0),
    noveltyBoost: clamp(noveltyBoost, 0.0, 1.0),
    learningRate: clamp(learningRate, 0.0, 1.0),
    inhibitionGain: clamp(inhibitionGain, 0.0, 1.0),
    uncertaintyBias: clamp(uncertaintyBias, 0.0, 1.0),
    safetyBias: clamp(safetyBias, 0.0, 1.0),
  }

  return {
    precisionControl,
    notes,
  }
}
