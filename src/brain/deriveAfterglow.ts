/**
 * Derive Afterglow
 * Calculates the afterglow strength for the next turn.
 * Afterglow represents residual activation from the previous turn.
 */

import type { ChunkedNodePipelineResult } from '../runtime/runChunkedNodePipeline'

/**
 * Derives afterglow strength based on current turn's activity.
 * Afterglow is a residual activation boost that carries over to the next turn.
 *
 * Range: 0-0.2 (as specified in requirements)
 *
 * Factors:
 * - Active feature count (more activity → stronger afterglow)
 * - Field intensity (stronger field → stronger afterglow)
 * - Heaviness/Fragility/Resonance (emotional weight → stronger afterglow)
 * - Natural decay over time
 *
 * @param chunkedResult The current turn's pipeline result
 * @param previousFieldIntensity Field intensity from the previous turn
 * @param previousAfterGlow Afterglow from the previous turn (for decay)
 * @returns Afterglow strength for the next turn (0-0.2)
 */
export const deriveAfterglow = (
  chunkedResult: ChunkedNodePipelineResult,
  previousFieldIntensity: number,
  previousAfterGlow: number,
): number => {
  // Activity ratio based on active features
  const activeFeatureCount = chunkedResult.chunkedStage.activeFeatures.length
  const maxExpectedFeatures = 20
  const activityRatio = Math.min(activeFeatureCount / maxExpectedFeatures, 1.0)

  // Emotional weight from field state
  const { heaviness = 0, fragility = 0 } = chunkedResult.stateVector
  const emotionalWeight = (heaviness + fragility) / 2

  // Surprise impact (strong surprise creates lingering activation)
  const surpriseImpact = chunkedResult.predictionModulationResult?.overallSurprise ?? 0

  // Combine factors
  const rawAfterGlow =
    activityRatio * 0.3 +
    previousFieldIntensity * 0.25 +
    emotionalWeight * 0.25 +
    surpriseImpact * 0.2

  // Apply natural decay to previous afterglow
  const decayedPrevious = previousAfterGlow * 0.7

  // Combine with new activity, capped at 0.2
  const combined = (rawAfterGlow + decayedPrevious) / 2
  return Math.min(combined * 0.2, 0.2)
}
