import type { PersonaWeightVector } from './types'
import { PERSONA_PROFILES } from './personaProfiles'

/**
 * Gets persona weight vector by ID.
 * Defaults to 'default' if not found.
 */
export const getPersonaWeightVector = (personaId?: string): PersonaWeightVector => {
  if (!personaId) {
    return PERSONA_PROFILES[0].weightVector
  }

  const profile = PERSONA_PROFILES.find((p) => p.id === personaId)
  return profile?.weightVector ?? PERSONA_PROFILES[0].weightVector
}
