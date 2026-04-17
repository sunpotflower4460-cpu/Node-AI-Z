import type { ChunkFeature } from '../signal/ingest/chunkTypes'
import type { PredictionState } from './types'
import { predictFeatures } from './predictFeatures'

/**
 * Build the next-turn PredictionState from the current turn's active features.
 *
 * This is the "prior update" step: after processing a turn, the runtime
 * calls this function to store what was observed so that the next turn
 * can compare incoming features against expectations.
 *
 * @param activeFeatures  The features that cleared all processing stages this turn
 * @param currentTurn     The turn number just completed
 * @returns A new PredictionState to be used as the prior on the next turn
 */
export const updatePredictionState = (
  activeFeatures: ChunkFeature[],
  currentTurn: number,
): PredictionState => {
  return predictFeatures(activeFeatures, currentTurn)
}
