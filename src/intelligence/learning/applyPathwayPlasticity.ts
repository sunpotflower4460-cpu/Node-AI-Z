import type { Signal } from '../signal/types'
import type { SessionLearningState, PersonalLearningState } from './types'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/**
 * Apply pathway plasticity boosts to signal activation strengths.
 *
 * Both session and personal pathway weights are consulted:
 *   - Personal weights have a larger effect (they reflect durable patterns).
 *   - Session weights have a smaller but immediate effect.
 *
 * The resulting signal array is a new array; original signals are not mutated.
 */
export const applyPathwayPlasticity = (
  signals: Signal[],
  session: SessionLearningState,
  personal: PersonalLearningState,
): Signal[] => {
  return signals.map((signal) => {
    let boost = 0

    // Aggregate boost from all trigger-level pathway keys
    for (const pathway of signal.pathways) {
      const key = `${signal.id}:${pathway}`
      boost += (session.pathwayStrengths[key] ?? 0) * 0.15
      boost += (personal.pathwayStrengths[key] ?? 0) * 0.25
    }

    // Also apply signal-level key (no specific trigger)
    boost += (session.pathwayStrengths[signal.id] ?? 0) * 0.10
    boost += (personal.pathwayStrengths[signal.id] ?? 0) * 0.15

    if (boost === 0) return signal

    return { ...signal, strength: clamp(signal.strength + boost, 0, 0.99) }
  })
}
