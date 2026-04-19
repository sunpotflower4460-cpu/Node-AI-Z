import type { UtteranceIntent } from '../utterance/types'
import type { PersonaWeightVector } from './types'

/**
 * Applies persona weight vector to utterance intent.
 * Persona affects softness, directness, and reflectiveness of expression.
 */
export const applyPersonaToUtterance = (
  utteranceIntent: UtteranceIntent,
  persona: PersonaWeightVector,
): UtteranceIntent => {
  const { utteranceBias } = persona

  // Apply softness: higher softness increases emotional distance slightly
  const softnessModulation = (utteranceBias.softness - 0.5) * 0.15
  const modulatedDistance = Math.max(
    0,
    Math.min(1, utteranceIntent.emotionalDistance + softnessModulation),
  )

  // Apply directness: higher directness reduces withhold tendency
  const directnessModulation = (utteranceBias.directness - 0.5) * 0.2
  const modulatedWithhold = Math.max(
    0,
    Math.min(1, utteranceIntent.withholdTendency - directnessModulation),
  )

  return {
    ...utteranceIntent,
    emotionalDistance: modulatedDistance,
    withholdTendency: modulatedWithhold,
    trace: [
      ...(utteranceIntent.trace || []),
      `persona:${persona.id} soft=${utteranceBias.softness.toFixed(2)} dir=${utteranceBias.directness.toFixed(2)} refl=${utteranceBias.reflectiveness.toFixed(2)}`,
    ],
  }
}
