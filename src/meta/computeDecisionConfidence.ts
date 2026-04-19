/**
 * Decision Confidence Computation
 *
 * Computes decision strength: how strongly the system is pulled toward
 * a particular option or utterance intent.
 *
 * This is separate from interpretation confidence (meta-level belief).
 */

import type { OptionAwareness } from '../option/types'
import type { FusedState } from '../fusion/types'

export type DecisionStrengthResult = {
  /** Raw decision strength (0-1) */
  strength: number
  /** Contributing factors */
  factors: {
    optionPull: number
    fusedConfidence: number
    fieldCoherence: number
  }
  debugNotes: string[]
}

/**
 * Compute decision strength from option awareness and fused state
 */
export const computeDecisionStrength = (
  optionAwareness: OptionAwareness | undefined,
  fusedState: FusedState,
  fieldCoherence: number, // From state vector analysis
): DecisionStrengthResult => {
  const debugNotes: string[] = []

  // Option pull: how strongly options are competing
  const optionPull = optionAwareness?.confidence ?? 0.5
  debugNotes.push(`Option pull: ${optionPull.toFixed(3)}`)

  // Fused confidence: how confident the dual stream is
  const fusedConfidence = fusedState.fusedConfidence
  debugNotes.push(`Fused confidence: ${fusedConfidence.toFixed(3)}`)

  // Field coherence: how organized the field is
  const coherence = Math.max(0, Math.min(1, fieldCoherence))
  debugNotes.push(`Field coherence: ${coherence.toFixed(3)}`)

  // Decision strength is weighted combination
  const strength = (
    optionPull * 0.4 +
    fusedConfidence * 0.4 +
    coherence * 0.2
  )

  debugNotes.push(`Decision strength: ${strength.toFixed(3)}`)

  return {
    strength,
    factors: {
      optionPull,
      fusedConfidence,
      fieldCoherence: coherence,
    },
    debugNotes,
  }
}
