/**
 * Derive Recent Activity Average
 * Calculates the average activity level across recent turns.
 * Used to modulate thresholds and system responsiveness.
 */

import type { ChunkedNodePipelineResult } from '../runtime/runChunkedNodePipeline'

/**
 * Derives recent activity average from the current turn's result.
 * This metric represents how "busy" the system has been.
 *
 * Range: 0-1
 *
 * Factors:
 * - Active feature ratio (active / raw features)
 * - Surprise level (high surprise → high activity)
 * - Option competition intensity
 * - Previous activity average (smoothing)
 *
 * @param chunkedResult The current turn's pipeline result
 * @param previousActivityAverage Activity average from the previous turn
 * @returns Recent activity average for the next turn (0-1)
 */
export const deriveRecentActivityAverage = (
  chunkedResult: ChunkedNodePipelineResult,
  previousActivityAverage: number,
): number => {
  // Feature activation ratio
  const activeFeatureCount = chunkedResult.chunkedStage.activeFeatures.length
  const totalRawFeatures = chunkedResult.chunkedStage.rawFeatures.length
  const featureRatio = totalRawFeatures > 0 ? activeFeatureCount / totalRawFeatures : 0.5

  // Surprise contribution
  const surpriseLevel = chunkedResult.predictionModulationResult?.overallSurprise ?? 0

  // Option competition intensity
  const optionIntensity = chunkedResult.optionCompetition
    ? Math.min(chunkedResult.optionCompetition.optionFields.length / 3, 1.0)
    : 0

  // Current turn activity
  const currentActivity = (featureRatio * 0.5 + surpriseLevel * 0.3 + optionIntensity * 0.2)

  // Smooth with previous average (exponential moving average, alpha = 0.3)
  const smoothed = previousActivityAverage * 0.7 + currentActivity * 0.3

  return Math.max(0, Math.min(smoothed, 1.0))
}
