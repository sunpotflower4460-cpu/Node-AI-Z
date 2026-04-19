/**
 * Interpretation Confidence Computation
 *
 * Computes meta-confidence: how much the system trusts its own interpretation
 * of the input. This is separate from decision strength.
 *
 * Low interpretation confidence should cause the system to:
 * - Hold decision
 * - Explore more
 * - Ask clarifying questions
 * - Soften utterances
 */

import type { PredictionModulationResult } from '../predictive/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'

export type InterpretationConfidenceResult = {
  /** Interpretation confidence (0-1) */
  confidence: number
  /** Contributing factors */
  factors: {
    predictionAlignment: number
    meaningCoherence: number
    optionClarity: number
  }
  debugNotes: string[]
}

/**
 * Compute interpretation confidence from prediction errors and proto-meanings
 */
export const computeInterpretationConfidence = (
  predictionModulation: PredictionModulationResult | undefined,
  sensoryMeanings: ProtoMeaning[],
  narrativeMeanings: ProtoMeaning[],
  optionAwareness: OptionAwareness | undefined,
): InterpretationConfidenceResult => {
  const debugNotes: string[] = []

  // Prediction alignment: low surprise = high confidence
  const surpriseLevel = predictionModulation?.overallSurprise ?? 0.5
  const predictionAlignment = 1.0 - surpriseLevel
  debugNotes.push(`Prediction alignment: ${predictionAlignment.toFixed(3)} (surprise: ${surpriseLevel.toFixed(3)})`)

  // Meaning coherence: strong, consistent meanings = high confidence
  const avgSensoryStrength = sensoryMeanings.length > 0
    ? sensoryMeanings.reduce((sum, m) => sum + m.strength, 0) / sensoryMeanings.length
    : 0.3
  const avgNarrativeStrength = narrativeMeanings.length > 0
    ? narrativeMeanings.reduce((sum, m) => sum + m.strength, 0) / narrativeMeanings.length
    : 0.3
  const meaningCoherence = (avgSensoryStrength + avgNarrativeStrength) / 2
  debugNotes.push(`Meaning coherence: ${meaningCoherence.toFixed(3)}`)

  // Option clarity: clear dominant option = high confidence
  // Ambiguous options = low confidence
  const optionClarity = optionAwareness?.confidence ?? 0.5
  debugNotes.push(`Option clarity: ${optionClarity.toFixed(3)}`)

  // Interpretation confidence is weighted combination
  const confidence = (
    predictionAlignment * 0.4 +
    meaningCoherence * 0.3 +
    optionClarity * 0.3
  )

  debugNotes.push(`Interpretation confidence: ${confidence.toFixed(3)}`)

  return {
    confidence,
    factors: {
      predictionAlignment,
      meaningCoherence,
      optionClarity,
    },
    debugNotes,
  }
}

/**
 * Confidence state combining decision and interpretation
 */
export type ConfidenceState = {
  /** Decision strength (0-1) */
  decisionStrength: number
  /** Interpretation confidence (0-1) */
  interpretationConfidence: number
  /** Gap between decision and interpretation */
  confidenceGap: number
  /** Should ask for clarification */
  shouldAsk: boolean
  /** Should hold decision */
  shouldHold: boolean
}

/**
 * Derive behavioral flags from confidence state
 */
export const deriveConfidenceBehavior = (
  decisionStrength: number,
  interpretationConfidence: number,
): ConfidenceState => {
  const confidenceGap = Math.abs(decisionStrength - interpretationConfidence)

  // High decision strength but low interpretation confidence = ask/soften
  const shouldAsk = decisionStrength > 0.6 && interpretationConfidence < 0.4

  // Low interpretation confidence overall = hold decision
  const shouldHold = interpretationConfidence < 0.3

  return {
    decisionStrength,
    interpretationConfidence,
    confidenceGap,
    shouldAsk,
    shouldHold,
  }
}
