import type { ProtoMeaning } from '../meaning/types'
import type { PersonaWeightVector } from './types'

/**
 * Applies persona weight vector to proto meanings.
 * Persona biases certain meanings based on gloss patterns.
 */
export const applyPersonaToProtoMeanings = (
  protoMeanings: ProtoMeaning[],
  persona: PersonaWeightVector,
): ProtoMeaning[] => {
  return protoMeanings.map((meaning) => {
    // Check if any bias pattern matches the gloss
    let maxBias = 1.0
    for (const [pattern, bias] of Object.entries(persona.meaningBias)) {
      if (meaning.glossJa.includes(pattern)) {
        maxBias = Math.max(maxBias, bias)
      }
    }

    const modulatedStrength = Math.min(1, meaning.strength * maxBias)

    return {
      ...meaning,
      strength: modulatedStrength,
    }
  })
}
