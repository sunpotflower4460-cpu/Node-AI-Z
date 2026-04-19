/**
 * Persona layer types for Crystallized Thinking Pass 3.
 * Persona = "which signals are naturally picked up more strongly"
 */

export type PersonaWeightVector = {
  id: string
  label: string
  signalBias: Record<string, number> // cue_id -> weight multiplier
  meaningBias: Record<string, number> // meaning gloss pattern -> weight
  optionBias: {
    exploreDepth: number // 0.0 - 1.0, higher = dig deeper into options
    compareIntensity: number // 0.0 - 1.0, higher = stronger comparison
    decisionSpeed: number // 0.0 - 1.0, higher = faster decision
  }
  utteranceBias: {
    softness: number // 0.0 - 1.0, higher = more gentle expression
    directness: number // 0.0 - 1.0, higher = more direct
    reflectiveness: number // 0.0 - 1.0, higher = more reflective
  }
}

export type PersonaProfile = {
  id: string
  name: string
  description: string
  weightVector: PersonaWeightVector
}
