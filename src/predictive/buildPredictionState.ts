import type { PredictionState } from './types'

/**
 * Create a blank prediction state with no expectations.
 *
 * Used as the initial state before the system has observed any turns,
 * or when no prior information is available.
 */
export const buildEmptyPredictionState = (basedOnTurn = 0): PredictionState => ({
  expectedFeatureIds: [],
  expectedFeatureStrengths: {},
  confidence: 0,
  basedOnTurn,
})
