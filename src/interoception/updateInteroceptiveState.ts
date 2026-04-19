/**
 * Update Interoceptive State
 *
 * Phase 3: Updates interoceptive state based on current processing results.
 * This is the bridge from somatic influence and runtime state into interoceptive control.
 */

import type { InteroceptiveState } from './interoceptiveState'
import type { SomaticInfluence } from '../somatic/types'
import type { UncertaintyState } from '../predictive/uncertaintyTypes'
import type { ConfidenceState } from '../meta/computeInterpretationConfidence'

export type UpdateInteroceptiveStateInput = {
  previousState: InteroceptiveState
  somaticInfluence?: SomaticInfluence
  uncertaintyState?: UncertaintyState
  confidenceState?: ConfidenceState
  surpriseMagnitude: number
  currentTurn: number
  recentActivityScore: number
}

/**
 * Update interoceptive state based on current turn results.
 *
 * Key principle: Somatic influence is NOT the final decision modifier.
 * Instead, it feeds INTO interoceptive state, which then causally affects
 * threshold, inhibition, precision, coalition weighting, etc.
 */
export const updateInteroceptiveState = ({
  previousState,
  somaticInfluence,
  uncertaintyState,
  confidenceState,
  surpriseMagnitude,
  currentTurn,
  recentActivityScore,
}: UpdateInteroceptiveStateInput): InteroceptiveState => {
  // Energy: decreases with activity, recovers slowly
  // High activity drains energy, somatic safety/helpfulness provide buffer
  const activityDrain = recentActivityScore * 0.1
  const somaticBuffer = somaticInfluence
    ? (somaticInfluence.averageOutcome.safety + somaticInfluence.averageOutcome.helpfulness) * 0.05
    : 0
  const energyRecovery = 0.05 // slow natural recovery
  let energy = previousState.energy - activityDrain + energyRecovery + somaticBuffer
  energy = Math.max(0.1, Math.min(1.0, energy))

  // Arousal: increases with surprise and uncertainty
  const surpriseBoost = surpriseMagnitude * 0.3
  const uncertaintyBoost = uncertaintyState
    ? (uncertaintyState.sensoryUncertainty + uncertaintyState.modelUncertainty) * 0.1
    : 0
  const arousalDecay = 0.1 // decay toward baseline
  let arousal = previousState.arousal + surpriseBoost + uncertaintyBoost - arousalDecay
  arousal = Math.max(0.0, Math.min(1.0, arousal))

  // Overload: increases with high activity and low confidence
  const activityPressure = recentActivityScore > 0.7 ? 0.15 : 0
  const confidencePressure = confidenceState && !confidenceState.canCommit ? 0.1 : 0
  const overloadRelief = 0.08 // gradual relief
  let overload = previousState.overload + activityPressure + confidencePressure - overloadRelief
  overload = Math.max(0.0, Math.min(1.0, overload))

  // Recovery pressure: increases when energy is low or overload is high
  const lowEnergyPressure = energy < 0.4 ? 0.2 : 0
  const highOverloadPressure = overload > 0.6 ? 0.15 : 0
  const recoveryRelief = 0.05 // slow decay
  let recoveryPressure = previousState.recoveryPressure + lowEnergyPressure + highOverloadPressure - recoveryRelief
  recoveryPressure = Math.max(0.0, Math.min(1.0, recoveryPressure))

  // Social safety: influenced by somatic safety outcome
  const somaticSafetySignal = somaticInfluence
    ? somaticInfluence.averageOutcome.safety * 0.2
    : 0
  const safetyDecay = 0.05 // gradual decay toward neutral
  let socialSafety = previousState.socialSafety + somaticSafetySignal - safetyDecay
  socialSafety = Math.max(0.0, Math.min(1.0, socialSafety))

  // Novelty hunger: increases over time, decreases when surprise is satisfied
  const hungerIncrease = 0.03 // gradual increase
  const surpriseSatisfaction = surpriseMagnitude > 0.5 ? 0.2 : 0
  let noveltyHunger = previousState.noveltyHunger + hungerIncrease - surpriseSatisfaction
  noveltyHunger = Math.max(0.0, Math.min(1.0, noveltyHunger))

  // Uncertainty tolerance: influenced by somatic openness and confidence
  const somaticOpennessSignal = somaticInfluence
    ? somaticInfluence.averageOutcome.openness * 0.15
    : 0
  const confidenceBoost = confidenceState?.shouldExplore ? 0.1 : 0
  const toleranceDecay = 0.05 // gradual decay toward neutral
  let uncertaintyTolerance = previousState.uncertaintyTolerance + somaticOpennessSignal + confidenceBoost - toleranceDecay
  uncertaintyTolerance = Math.max(0.0, Math.min(1.0, uncertaintyTolerance))

  return {
    energy,
    arousal,
    overload,
    recoveryPressure,
    socialSafety,
    noveltyHunger,
    uncertaintyTolerance,
  }
}
