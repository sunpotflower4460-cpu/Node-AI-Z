import type { PersonaProfile, PersonaWeightVector } from './types'

/**
 * Predefined persona profiles.
 * These are minimal starter profiles - not a full persona system.
 */

const DEFAULT_WEIGHT_VECTOR: PersonaWeightVector = {
  id: 'default',
  label: 'Default Crystallized',
  signalBias: {
    uncertainty_cue: 1.2,
    distress_cue: 1.1,
    motivation_drop: 1.1,
    faint_possibility_cue: 1.0,
  },
  meaningBias: {
    '迷': 1.1,
    '重': 1.1,
    '探': 1.0,
    '待': 1.0,
  },
  optionBias: {
    exploreDepth: 0.6,
    compareIntensity: 0.5,
    decisionSpeed: 0.4,
  },
  utteranceBias: {
    softness: 0.7,
    directness: 0.4,
    reflectiveness: 0.6,
  },
}

const GENTLE_WEIGHT_VECTOR: PersonaWeightVector = {
  id: 'gentle',
  label: 'Gentle Holder',
  signalBias: {
    distress_cue: 1.3,
    uncertainty_cue: 1.2,
    fragility_cue: 1.4,
    motivation_drop: 1.2,
  },
  meaningBias: {
    '重': 1.3,
    '迷': 1.2,
    'もろ': 1.3,
  },
  optionBias: {
    exploreDepth: 0.5,
    compareIntensity: 0.3,
    decisionSpeed: 0.2,
  },
  utteranceBias: {
    softness: 0.9,
    directness: 0.2,
    reflectiveness: 0.8,
  },
}

const EXPLORER_WEIGHT_VECTOR: PersonaWeightVector = {
  id: 'explorer',
  label: 'Deep Explorer',
  signalBias: {
    faint_possibility_cue: 1.4,
    contrast_cue: 1.3,
    change_option_cue: 1.2,
    uncertainty_cue: 1.1,
  },
  meaningBias: {
    '探': 1.4,
    '可能': 1.3,
    '対比': 1.2,
  },
  optionBias: {
    exploreDepth: 0.9,
    compareIntensity: 0.7,
    decisionSpeed: 0.3,
  },
  utteranceBias: {
    softness: 0.5,
    directness: 0.6,
    reflectiveness: 0.7,
  },
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  {
    id: 'default',
    name: 'Default Crystallized',
    description: 'Balanced crystallized thinking persona',
    weightVector: DEFAULT_WEIGHT_VECTOR,
  },
  {
    id: 'gentle',
    name: 'Gentle Holder',
    description: 'Focuses on holding distress and fragility gently',
    weightVector: GENTLE_WEIGHT_VECTOR,
  },
  {
    id: 'explorer',
    name: 'Deep Explorer',
    description: 'Emphasizes exploration and possibility discovery',
    weightVector: EXPLORER_WEIGHT_VECTOR,
  },
]
