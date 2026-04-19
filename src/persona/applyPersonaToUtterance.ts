import type { UtteranceIntent } from '../utterance/types'
import type { PersonaWeightVector } from './types'

/**
 * Applies persona weight vector to utterance intent.
 * Persona affects softness (warmth), directness (answerForce), and reflectiveness (ambiguityTolerance).
 */
export const applyPersonaToUtterance = (
  utteranceIntent: UtteranceIntent,
  persona: PersonaWeightVector,
): UtteranceIntent => {
  const { utteranceBias } = persona

  // Apply softness: higher softness increases warmth
  const softnessModulation = (utteranceBias.softness - 0.5) * 0.2
  const modulatedWarmth = Math.max(
    0,
    Math.min(1, utteranceIntent.warmth + softnessModulation),
  )

  // Apply directness: higher directness increases answerForce
  const directnessModulation = (utteranceBias.directness - 0.5) * 0.2
  const modulatedAnswerForce = Math.max(
    0,
    Math.min(1, utteranceIntent.answerForce + directnessModulation),
  )

  // Apply reflectiveness: higher reflectiveness increases ambiguity tolerance
  const reflectivenessModulation = (utteranceBias.reflectiveness - 0.5) * 0.2
  const modulatedAmbiguity = Math.max(
    0,
    Math.min(1, utteranceIntent.ambiguityTolerance + reflectivenessModulation),
  )

  return {
    ...utteranceIntent,
    warmth: modulatedWarmth,
    answerForce: modulatedAnswerForce,
    ambiguityTolerance: modulatedAmbiguity,
  }
}
