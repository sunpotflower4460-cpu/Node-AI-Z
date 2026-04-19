import type { OptionAwareness } from '../option/types'
import type { PersonaWeightVector } from './types'

/**
 * Applies persona weight vector to option awareness.
 * Persona affects exploration depth and comparison intensity.
 */
export const applyPersonaToOptionAwareness = (
  optionAwareness: OptionAwareness | undefined,
  persona: PersonaWeightVector,
): OptionAwareness | undefined => {
  if (!optionAwareness) return undefined

  const { optionBias } = persona

  // Modulate confidence based on explore depth
  // Higher exploreDepth increases confidence in options
  const exploreModulation = 1 + (optionBias.exploreDepth - 0.5) * 0.2
  const modulatedConfidence = Math.min(1, optionAwareness.confidence * exploreModulation)

  return {
    ...optionAwareness,
    confidence: modulatedConfidence,
  }
}
