/**
 * Apply Interoceptive Control
 *
 * Phase 3: Applies interoceptive state to causally modify runtime parameters.
 * This is NOT cosmetic. It changes threshold, inhibition strength, precision weights, etc.
 */

import type { InteroceptiveState } from './interoceptiveState'

/**
 * Control parameters derived from interoceptive state
 */
export type InteroceptiveControl = {
  /**
   * Threshold multiplier (0.5 - 2.0)
   * Low energy/high overload -> higher threshold (more selective)
   * High arousal/novelty hunger -> lower threshold (more receptive)
   */
  thresholdMultiplier: number

  /**
   * Inhibition strength multiplier (0.5 - 1.5)
   * High overload -> stronger inhibition (more filtering)
   * High novelty hunger -> weaker inhibition (more open)
   */
  inhibitionMultiplier: number

  /**
   * Precision weighting for prediction errors (0.3 - 1.5)
   * High arousal -> higher precision (trust signals more)
   * High overload -> lower precision (discount noisy signals)
   */
  precisionWeight: number

  /**
   * Coalition stability bias (-0.3 to +0.3)
   * High uncertainty tolerance -> favor diverse coalitions
   * Low energy -> favor stable single coalitions
   */
  coalitionStabilityBias: number

  /**
   * Replay eligibility multiplier (0.0 - 2.0)
   * High recovery pressure -> more replay
   * High arousal -> less replay (focus on current)
   */
  replayEligibilityMultiplier: number

  /**
   * Workspace phase transition speed (0.5 - 2.0)
   * High arousal -> faster transitions
   * High overload -> slower, more cautious transitions
   */
  workspaceTransitionSpeed: number
}

/**
 * Compute control parameters from interoceptive state.
 *
 * This is where interoception causally affects the runtime.
 * Each parameter directly modifies how features, options, coalitions, etc. are processed.
 */
export const applyInteroceptiveControl = (
  state: InteroceptiveState,
): InteroceptiveControl => {
  // Threshold multiplier: higher when tired/overloaded, lower when aroused/hungry
  const energyFactor = 2.0 - state.energy // low energy -> high factor
  const overloadFactor = 1.0 + state.overload * 0.5 // high overload -> higher threshold
  const arousalFactor = 1.0 - state.arousal * 0.3 // high arousal -> lower threshold
  const noveltyFactor = 1.0 - state.noveltyHunger * 0.2 // high hunger -> lower threshold
  let thresholdMultiplier = energyFactor * 0.3 + overloadFactor * 0.3 + arousalFactor * 0.2 + noveltyFactor * 0.2
  thresholdMultiplier = Math.max(0.5, Math.min(2.0, thresholdMultiplier))

  // Inhibition multiplier: stronger when overloaded, weaker when seeking novelty
  const inhibitionFromOverload = 1.0 + state.overload * 0.5
  const inhibitionFromNovelty = 1.0 - state.noveltyHunger * 0.3
  let inhibitionMultiplier = inhibitionFromOverload * 0.6 + inhibitionFromNovelty * 0.4
  inhibitionMultiplier = Math.max(0.5, Math.min(1.5, inhibitionMultiplier))

  // Precision weight: higher when aroused and confident, lower when overloaded
  const precisionFromArousal = state.arousal * 0.5
  const precisionFromOverload = -state.overload * 0.4
  let precisionWeight = 1.0 + precisionFromArousal + precisionFromOverload
  precisionWeight = Math.max(0.3, Math.min(1.5, precisionWeight))

  // Coalition stability bias: diverse when tolerant, stable when tired
  const diversityFromTolerance = state.uncertaintyTolerance * 0.3
  const stabilityFromEnergy = (1.0 - state.energy) * 0.3
  const coalitionStabilityBias = stabilityFromEnergy - diversityFromTolerance

  // Replay eligibility: high when recovery pressure is high, low when aroused
  const replayFromRecovery = state.recoveryPressure * 1.5
  const replayFromArousal = -state.arousal * 0.5
  let replayEligibilityMultiplier = 1.0 + replayFromRecovery + replayFromArousal
  replayEligibilityMultiplier = Math.max(0.0, Math.min(2.0, replayEligibilityMultiplier))

  // Workspace transition speed: fast when aroused, slow when overloaded
  const speedFromArousal = state.arousal * 1.0
  const speedFromOverload = -state.overload * 0.8
  let workspaceTransitionSpeed = 1.0 + speedFromArousal + speedFromOverload
  workspaceTransitionSpeed = Math.max(0.5, Math.min(2.0, workspaceTransitionSpeed))

  return {
    thresholdMultiplier,
    inhibitionMultiplier,
    precisionWeight,
    coalitionStabilityBias,
    replayEligibilityMultiplier,
    workspaceTransitionSpeed,
  }
}
