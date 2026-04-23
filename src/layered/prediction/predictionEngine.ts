import type { Decision } from '../L6/types'
import type { SemanticFrame } from '../L4/types'
import type { Prediction, PredictionError } from './types'

/**
 * Generates a prediction for the next turn based on the current decision and semantic frame.
 *
 * @param decision - Current decision from L6.
 * @param semanticFrame - Current semantic frame from L4.
 * @returns Prediction for the next turn.
 */
export function generatePrediction(decision: Decision, semanticFrame: SemanticFrame): Prediction {
  const { action, askBack } = decision
  const { gist } = semanticFrame

  let expectedNeed: Prediction['expectedNeed'] = null
  let expectedSentenceType: Prediction['expectedSentenceType'] = null
  const expectedTopic = extractTopic(gist)

  switch (action) {
    case 'greet_back':
      if (askBack) {
        expectedNeed = 'connection'
        expectedSentenceType = 'greeting_question'
      } else {
        expectedNeed = 'connection'
        expectedSentenceType = 'statement'
      }
      break
    case 'answer':
      expectedNeed = 'acknowledgment'
      expectedSentenceType = 'reaction'
      break
    case 'listen':
      expectedNeed = 'expression'
      expectedSentenceType = 'feeling_expression'
      break
    case 'explore':
      if (askBack) {
        expectedNeed = 'reflection'
        expectedSentenceType = 'opinion_question'
      } else {
        expectedNeed = 'reflection'
        expectedSentenceType = 'statement'
      }
      break
    case 'ask_back':
      expectedNeed = null
      expectedSentenceType = 'statement'
      break
    case 'wait':
      expectedNeed = semanticFrame.need
      expectedSentenceType = null
      break
    case 'deflect':
      expectedNeed = 'unclear'
      expectedSentenceType = null
      break
    case 'express':
      expectedNeed = 'acknowledgment'
      expectedSentenceType = 'reaction'
      break
  }

  return {
    expectedNeed,
    expectedTopic,
    expectedSentenceType,
  }
}

/**
 * Computes the prediction error between the predicted and actual semantic frames.
 *
 * @param prediction - Prediction from the previous turn.
 * @param actual - Actual semantic frame from the current turn.
 * @returns Prediction error with mismatch flags and surprise score.
 */
export function computePredictionError(
  prediction: Prediction,
  actual: SemanticFrame,
): PredictionError {
  const needMismatch =
    prediction.expectedNeed !== null && prediction.expectedNeed !== actual.need

  const topicShift =
    prediction.expectedTopic !== null &&
    prediction.expectedTopic.length > 0 &&
    !actual.gist.includes(prediction.expectedTopic)

  let surprise = 0
  if (needMismatch) {
    surprise += 0.5
  }
  if (topicShift) {
    surprise += 0.3
  }
  if (actual.relation === 'shift') {
    surprise += 0.2
  }

  // Clamp to 0.0 - 1.0
  surprise = Math.max(0, Math.min(1, surprise))

  return {
    needMismatch,
    topicShift,
    surprise,
  }
}

/**
 * Extracts a short topic string from the semantic gist.
 *
 * @param gist - Semantic gist string.
 * @returns Topic string (max 30 characters).
 */
function extractTopic(gist: string): string {
  const patterns = [
    'について',
    'として',
    'という',
    'を',
    'が',
    'は',
    'と',
    'か',
    'の',
  ]

  let topic = gist
  for (const pattern of patterns) {
    const index = gist.indexOf(pattern)
    if (index > 0) {
      topic = gist.slice(0, index)
      break
    }
  }

  // Trim and cap at 30 characters
  topic = topic.trim()
  return topic.length <= 30 ? topic : topic.slice(0, 30)
}
