/**
 * Integrated Signal Runtime v2.3 — Predictive Coding + Surprise Layer types
 *
 * These types model the "prediction → actual → error → modulation" cycle:
 *   1. PredictionState  — the prior: what features were expected to fire
 *   2. PredictionError  — per-feature deviation from the prior
 *   3. SurpriseSignal   — foregrounded error signals above a significance threshold
 *   4. PredictionModulationResult — outcome of applying error-driven modulation to features
 */

import type { ChunkFeature } from '../ingest/chunkTypes'

/**
 * Prior / baseline prediction: the expected feature activations for the current turn,
 * derived from the previous turn's results.
 */
export type PredictionState = {
  /** IDs of features that were predicted to fire this turn */
  expectedFeatureIds: string[]
  /** Expected strength (0–1) per feature id */
  expectedFeatureStrengths: Record<string, number>
  /**
   * Confidence in this prediction (0–1).
   * 0 = no prior information; 1 = highly confident prediction.
   * Low confidence predictions contribute less to modulation.
   */
  confidence: number
  /** Turn number on which this prediction was generated */
  basedOnTurn: number
}

/** Classification of how a single feature deviated from its prediction */
export type PredictionErrorType =
  | 'unexpected_present' // feature fired but was not predicted
  | 'expected_absent'    // feature was predicted but did not fire
  | 'strength_higher'    // feature fired stronger than predicted
  | 'strength_lower'     // feature fired weaker than predicted
  | 'correct'            // prediction was within tolerance

/** Per-feature prediction error record */
export type PredictionError = {
  featureId: string
  /** Predicted strength (0 if feature was not predicted) */
  expected: number
  /** Actual strength (0 if feature did not fire) */
  actual: number
  /** |expected − actual| */
  error: number
  type: PredictionErrorType
}

/**
 * A surprise signal: a significant prediction error that merits
 * foreground treatment in the feature processing pipeline.
 */
export type SurpriseSignal = {
  featureId: string
  /** Scaled surprise magnitude (0–1): error × confidence */
  magnitude: number
  direction: 'unexpected_present' | 'expected_absent' | 'strength_higher' | 'strength_lower'
}

/** Result of applying prediction-error modulation to the feature set */
export type PredictionModulationResult = {
  /** Feature array after surprise-driven strength adjustments */
  features: ChunkFeature[]
  /** Surprise signals generated for this turn */
  surpriseSignals: SurpriseSignal[]
  /** All per-feature prediction errors (including 'correct' entries) */
  errors: PredictionError[]
  /** Overall surprise level across all surprise signals (0–1) */
  overallSurprise: number
  /**
   * Additive boost to field intensity for this turn (0–MAX_FIELD_BOOST).
   * Propagated to sessionLearning so that afterglow is influenced by surprise.
   */
  fieldIntensityBoost: number
  debugNotes: string[]
}
