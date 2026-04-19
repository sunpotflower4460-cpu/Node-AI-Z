/**
 * Persona layer.
 * Cross-layer weighting filters that bias signal / meaning / somatic / learning outputs.
 */

export { PERSONA_PROFILES } from './personaProfiles'
export { getPersonaWeightVector } from './getPersonaWeightVector'
export { applyPersonaToSignals } from './applyPersonaToSignals'
export { applyPersonaToProtoMeanings } from './applyPersonaToProtoMeanings'
export { applyPersonaToOptionAwareness } from './applyPersonaToOptionAwareness'
export { applyPersonaToUtterance } from './applyPersonaToUtterance'
export type { PersonaWeightVector, PersonaProfile } from './types'
