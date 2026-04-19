import type { PreconditionFilter } from './types'
import type { UtteranceIntent } from '../utterance/types'

/**
 * Applies precondition filter to utterance intent.
 * Preconditions subtly shape emotional distance and ambiguity tolerance.
 */
export const applyPreconditionToUtterance = (
  utteranceIntent: UtteranceIntent,
  precondition: PreconditionFilter,
): UtteranceIntent => {
  const { home, existence, belief } = precondition

  // Home: if allowOneLivingThread is high, increase structure need
  const homeStructureBoost = home.allowOneLivingThread * 0.1

  // Existence: selfPresence affects emotional distance
  // Higher selfPresence can mean more grounded, slightly closer emotional distance
  const existenceDistanceModulation = (1 - existence.selfPresence) * 0.1
  const modulatedDistance = Math.max(
    0,
    Math.min(1, utteranceIntent.emotionalDistance + existenceDistanceModulation),
  )

  // Belief: honorFragility increases ambiguity tolerance to protect delicate states
  const beliefAmbiguityBoost = belief.honorFragility * 0.1
  const modulatedAmbiguity = Math.min(
    1,
    utteranceIntent.ambiguityTolerance + beliefAmbiguityBoost,
  )

  // Belief: doNotForceTooEarly reduces answerForce
  const beliefAnswerReduction = belief.doNotForceTooEarly * 0.1
  const modulatedAnswerForce = Math.max(
    0,
    utteranceIntent.answerForce - beliefAnswerReduction,
  )

  return {
    ...utteranceIntent,
    emotionalDistance: modulatedDistance,
    ambiguityTolerance: modulatedAmbiguity,
    answerForce: modulatedAnswerForce,
    structureNeed: Math.min(1, utteranceIntent.structureNeed + homeStructureBoost),
  }
}
