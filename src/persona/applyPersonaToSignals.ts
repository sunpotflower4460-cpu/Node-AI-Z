import type { MicroCue } from '../signal/packetTypes'
import type { PersonaWeightVector } from './types'

/**
 * Applies persona weight vector to signal cues.
 * Persona biases certain cues to be picked up more strongly.
 */
export const applyPersonaToSignals = (
  cues: MicroCue[],
  persona: PersonaWeightVector,
): MicroCue[] => {
  return cues.map((cue) => {
    const biasMultiplier = persona.signalBias[cue.id] ?? 1.0
    const modulatedStrength = Math.min(1, cue.strength * biasMultiplier)

    return {
      ...cue,
      strength: modulatedStrength,
    }
  })
}
