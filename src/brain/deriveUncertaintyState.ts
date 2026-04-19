/**
 * Derive Uncertainty State
 *
 * Phase M2: Computes UncertaintyState from current turn's signals and conditions.
 *
 * Takes prediction errors, proto meanings, options, and recent activity
 * to estimate how novel, ambiguous, and volatile the current situation is.
 */

import type { UncertaintyState } from './precisionTypes'
import type { PredictionModulationResult } from '../predictive/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'
import type { MicroSignalDimensions } from './sessionBrainState'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/**
 * Derives uncertainty state from current turn conditions.
 *
 * @param predictionModulation - Prediction error and surprise signals
 * @param sensoryMeanings - Sensory proto meanings
 * @param narrativeMeanings - Narrative proto meanings
 * @param optionAwareness - Option awareness state
 * @param previousMicroSignal - Previous turn's micro signal dimensions
 * @param recentFieldIntensity - Recent field intensity
 * @param hasExplicitQuestion - Whether input contains explicit question
 */
export const deriveUncertaintyState = ({
  predictionModulation,
  sensoryMeanings,
  narrativeMeanings,
  optionAwareness,
  previousMicroSignal,
  recentFieldIntensity,
  hasExplicitQuestion = false,
}: {
  predictionModulation?: PredictionModulationResult
  sensoryMeanings: ProtoMeaning[]
  narrativeMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  previousMicroSignal?: MicroSignalDimensions
  recentFieldIntensity: number
  hasExplicitQuestion?: boolean
}): UncertaintyState => {
  // ===== Expectedness =====
  // High surprise → low expectedness
  const surpriseLevel = predictionModulation?.overallSurprise ?? 0.0
  const expectedness = clamp(1.0 - surpriseLevel, 0.0, 1.0)

  // ===== Novelty =====
  // High surprise + many unexpected_present errors → high novelty
  const unexpectedCount = predictionModulation?.errors.filter(
    (e) => e.type === 'unexpected_present'
  ).length ?? 0
  const totalErrors = predictionModulation?.errors.length ?? 1
  const unexpectedRatio = unexpectedCount / Math.max(totalErrors, 1)

  const novelty = clamp(
    (surpriseLevel * 0.6) + (unexpectedRatio * 0.4),
    0.0,
    1.0
  )

  // ===== Ambiguity =====
  // Multiple weak meanings OR tight option competition → high ambiguity
  const allMeanings = [...sensoryMeanings, ...narrativeMeanings]
  const meaningStrengthVariance = computeMeaningStrengthVariance(allMeanings)

  // Option ambivalence: when top options are close in strength
  const optionAmbivalence = optionAwareness
    ? computeOptionAmbivalence(optionAwareness)
    : 0.0

  // Explicit questions increase ambiguity (seeking information)
  const questionBoost = hasExplicitQuestion ? 0.3 : 0.0

  const ambiguity = clamp(
    (meaningStrengthVariance * 0.4) +
    (optionAmbivalence * 0.4) +
    questionBoost,
    0.0,
    1.0
  )

  // ===== Volatility Estimate =====
  // Field intensity jump + confidence change → volatility
  const currentFieldIntensity = predictionModulation?.fieldIntensityBoost ?? 0.0
  const fieldIntensityJump = Math.abs(currentFieldIntensity - recentFieldIntensity)

  // Confidence change from previous turn
  const currentConfidence = previousMicroSignal?.fusedConfidence ?? 0.5
  const previousConfidence = 0.5 // Default if no previous
  const confidenceJump = Math.abs(currentConfidence - previousConfidence)

  const volatilityEstimate = clamp(
    (fieldIntensityJump * 0.6) + (confidenceJump * 0.4),
    0.0,
    1.0
  )

  // ===== Confidence Drift =====
  // Weak proto meanings + low field coherence → high drift
  const avgMeaningStrength = allMeanings.length > 0
    ? allMeanings.reduce((sum, m) => sum + m.strength, 0) / allMeanings.length
    : 0.5

  const weakMeanings = 1.0 - avgMeaningStrength
  const lowConfidence = 1.0 - currentConfidence

  const confidenceDrift = clamp(
    (weakMeanings * 0.5) + (lowConfidence * 0.5),
    0.0,
    1.0
  )

  return {
    expectedness,
    novelty,
    ambiguity,
    volatilityEstimate,
    confidenceDrift,
  }
}

/**
 * Compute variance in meaning strengths.
 * High variance → meanings are polarized (some strong, some weak)
 * Low variance → meanings are uniformly weak (ambiguous)
 */
const computeMeaningStrengthVariance = (meanings: ProtoMeaning[]): number => {
  if (meanings.length === 0) return 0.5

  const avg = meanings.reduce((sum, m) => sum + m.strength, 0) / meanings.length
  const variance = meanings.reduce(
    (sum, m) => sum + Math.pow(m.strength - avg, 2),
    0
  ) / meanings.length

  // Low average + high variance → some meanings strong but not dominant
  // Low average + low variance → all weak (high ambiguity)
  if (avg < 0.3) {
    return clamp(1.0 - variance, 0.0, 1.0)
  }

  return clamp(variance, 0.0, 1.0)
}

/**
 * Compute option ambivalence.
 * When options are close in strength → high ambivalence
 * Uses differenceMagnitude and hesitationStrength from OptionAwareness
 */
const computeOptionAmbivalence = (optionAwareness: OptionAwareness): number => {
  // Low difference magnitude + high hesitation = high ambivalence
  const lowDifference = 1.0 - optionAwareness.differenceMagnitude
  const hesitation = optionAwareness.hesitationStrength

  // Bridge option possible also indicates ambivalence
  const bridgeBoost = optionAwareness.bridgeOptionPossible ? 0.3 : 0.0

  return clamp(
    (lowDifference * 0.5) + (hesitation * 0.3) + bridgeBoost,
    0.0,
    1.0
  )
}
