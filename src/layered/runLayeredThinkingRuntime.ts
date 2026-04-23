import { analyzeL0 } from './L0/charClassifier'
import { analyzeL1 } from './L1/tokenizer'
import { runL2 } from './L2/chunker'
import type { SentenceType } from './L3/types'
import { runL3 } from './L3/sentenceAnalyzer'
import { runL4 } from './L4/semanticInterpreter'
import { runL5 } from './L5/reactionGenerator'
import type { L5Result } from './L5/types'
import { runL6 } from './L6/decisionMaker'
import { runL7 } from './L7/utteranceRenderer'
import { createInitialBrainState, type BrainState } from './brainState'
import type { Prediction, PredictionError } from './prediction/types'
import type {
  LayeredThinkingResult,
  LayeredThinkingRuntimeInput,
  LayeredThinkingTrace,
} from './types'

/**
 * Runs the full layered-thinking pipeline from input text to final utterance.
 *
 * @param input - Runtime input for the layered pipeline.
 * @returns Full layered-thinking result.
 */
export async function runLayeredThinkingRuntime(
  input: LayeredThinkingRuntimeInput,
): Promise<LayeredThinkingResult> {
  const previousBrainState = input.brainState ?? createInitialBrainState()
  const l0Result = analyzeL0(input.text)
  const l1Result = analyzeL1(input.text)
  const l2Result = runL2(l1Result)
  const l3Result = runL3(l2Result, previousBrainState.turnCount + 1)
  const l4Result = runL4(l3Result, previousBrainState)
  const l5Result = runL5(l4Result, previousBrainState)
  const l6Result = runL6(l4Result, l5Result, previousBrainState)
  const predictionError = computePredictionError(previousBrainState, l6Result.decision.topic, l4Result.frame.need, l3Result.overallType)
  const l7Result = runL7(l4Result, l5Result, l6Result, previousBrainState)
  const nextPrediction = deriveNextPrediction(l4Result.frame.need, l6Result.decision.topic, l6Result.decision.askBack, l3Result.overallType)
  const nextBrainState = buildNextBrainState(previousBrainState, l4Result, l5Result, l6Result, l7Result.utterance, nextPrediction, predictionError)
  const trace: LayeredThinkingTrace = {
    characterNodes: l0Result.nodes,
    l0Summary: l0Result.summary,
    tokenNodes: l1Result.nodes,
    l1Summary: l1Result.summary,
    chunkNodes: l2Result.chunks,
    l2Summary: l2Result.summary,
    l3Result,
    l4Result,
    l5Result,
    l6Result,
    l7Result,
    predictionError,
    nextPrediction,
    nextBrainState,
  }

  return {
    utterance: l7Result.utterance,
    trace,
  }
}

/**
 * Computes prediction error against the previous brain state's expectation.
 *
 * @param brainState - Previous brain state.
 * @param topic - Current conversational topic.
 * @param need - Current semantic need.
 * @param sentenceType - Current sentence type.
 * @returns Prediction error summary or null on the first turn.
 */
function computePredictionError(
  brainState: BrainState,
  topic: string,
  need: BrainState['prediction']['expectedNeed'] | null,
  sentenceType: SentenceType,
): PredictionError | null {
  if (brainState.turnCount === 0 || brainState.prediction.expectedNeed === null) {
    return null
  }

  const needMismatch = brainState.prediction.expectedNeed !== need
  const topicShift =
    brainState.prediction.expectedTopic !== null &&
    topic.length > 0 &&
    brainState.prediction.expectedTopic !== topic
  const sentenceShift =
    brainState.prediction.expectedSentenceType !== null &&
    brainState.prediction.expectedSentenceType !== sentenceType

  return {
    needMismatch,
    topicShift,
    surprise: clamp((needMismatch ? 0.5 : 0) + (topicShift ? 0.3 : 0) + (sentenceShift ? 0.2 : 0), 0, 1),
  }
}

/**
 * Derives the next-turn prediction from the current decision.
 *
 * @param need - Current semantic need.
 * @param topic - Current conversational topic.
 * @param askBack - Whether the system is asking the user to continue.
 * @param sentenceType - Current sentence type.
 * @returns Next prediction state.
 */
function deriveNextPrediction(
  need: BrainState['prediction']['expectedNeed'] | null,
  topic: string,
  askBack: boolean,
  sentenceType: SentenceType,
): Prediction {
  if (askBack) {
    const expectedNeed = resolveAskBackExpectedNeed(need)

    return {
      expectedNeed,
      expectedTopic: need === 'connection' ? '相手の様子' : topic || null,
      expectedSentenceType: need === 'expression' ? 'feeling_expression' : sentenceType,
    }
  }

  return {
    expectedNeed: need,
    expectedTopic: topic || null,
    expectedSentenceType: sentenceType,
  }
}

/**
 * Resolves the likely next semantic need after an ask-back turn.
 *
 * @param need - Current semantic need.
 * @returns Expected next semantic need.
 */
function resolveAskBackExpectedNeed(
  need: BrainState['prediction']['expectedNeed'] | null,
): Prediction['expectedNeed'] {
  switch (need) {
    case 'connection':
      return 'connection'
    case 'expression':
      return 'expression'
    default:
      return 'information'
  }
}

/**
 * Builds the next brain state after the current turn completes.
 *
 * @param brainState - Previous brain state.
 * @param l4Result - Semantic-layer result.
 * @param l5Result - Reaction-layer result.
 * @param l6Result - Decision-layer result.
 * @param utterance - Final utterance.
 * @param nextPrediction - Next prediction state.
 * @param predictionError - Current prediction error.
 * @returns Updated brain state.
 */
function buildNextBrainState(
  brainState: BrainState,
  l4Result: LayeredThinkingResult['trace']['l4Result'],
  l5Result: L5Result,
  l6Result: LayeredThinkingResult['trace']['l6Result'],
  utterance: string,
  nextPrediction: Prediction,
  predictionError: PredictionError | null,
): BrainState {
  return {
    turnCount: brainState.turnCount + 1,
    lastSemantic: l4Result.frame,
    lastDecision: l6Result.decision,
    lastUtterance: utterance,
    prediction: nextPrediction,
    mood: deriveMood(l5Result.reaction.feelsSafe, l6Result.decision, predictionError),
    recentTopics: updateRecentTopics(brainState.recentTopics, l6Result.decision.topic),
  }
}

/**
 * Derives the next coarse mood.
 *
 * @param feelsSafe - Whether the turn feels safe enough.
 * @param decision - Current decision.
 * @param predictionError - Current prediction error.
 * @returns Next mood.
 */
function deriveMood(
  feelsSafe: boolean,
  decision: LayeredThinkingResult['trace']['l6Result']['decision'],
  predictionError: PredictionError | null,
): BrainState['mood'] {
  if (decision.showUncertainty || (predictionError?.surprise ?? 0) > 0.6) {
    return 'uncertain'
  }

  if (decision.warmthBand === 'warm') {
    return 'light'
  }

  if (!feelsSafe) {
    return 'heavy'
  }

  return 'neutral'
}

/**
 * Updates recent-topic memory with the latest topic.
 *
 * @param recentTopics - Existing recent topics.
 * @param topic - Latest topic.
 * @returns Updated recent topic list.
 */
function updateRecentTopics(recentTopics: string[], topic: string): string[] {
  if (!topic) {
    return recentTopics
  }

  return [topic, ...recentTopics.filter(item => item !== topic)].slice(0, 5)
}

/**
 * Clamps a numeric value into an inclusive range.
 *
 * @param value - Raw value.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns Clamped value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
