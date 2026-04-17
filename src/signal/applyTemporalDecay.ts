import type { ChunkFeature } from './ingest/chunkTypes'
import type { TemporalFeatureState } from './temporalTypes'

const DEFAULT_DECAY_RATE = 0.1
const DECAY_FLOOR = 0.01 // values below this are zeroed out

/**
 * Apply exponential temporal decay to feature strengths.
 *
 * For each feature:
 *   decayedStrength = currentStrength × exp(−decayRate × elapsed)
 *
 * Features without `lastFiredTurn` are treated as freshly fired this turn
 * (elapsed = 0, no decay applied), and their `lastFiredTurn` is set to
 * `currentTurn`.
 *
 * Optional `previousStates` map can carry decay rates / lastFiredTurn from
 * prior turns; values from the feature itself take precedence.
 *
 * Design note: the function is intentionally kept feature-centric so that
 * the same logic can later be applied to node-level states by passing a
 * compatible array.
 */
export const applyTemporalDecay = (
  features: ChunkFeature[],
  currentTurn: number,
  previousStates?: Map<string, TemporalFeatureState>,
): { features: ChunkFeature[]; debugNotes: string[] } => {
  const notes: string[] = []

  const decayed = features.map((f): ChunkFeature => {
    const prevState = previousStates?.get(f.id)

    // Resolve lastFiredTurn (feature field > previous state > treat as current)
    const lastFiredTurn =
      f.lastFiredTurn ?? prevState?.lastFiredTurn ?? currentTurn

    // Resolve decayRate (feature field > previous state > default)
    const decayRate =
      f.decayRate ?? prevState?.decayRate ?? DEFAULT_DECAY_RATE

    const elapsed = Math.max(0, currentTurn - lastFiredTurn)

    if (elapsed === 0) {
      // Freshly fired this turn — no decay, but stamp the turn
      return { ...f, lastFiredTurn: currentTurn, decayRate }
    }

    const before = f.strength
    const raw = before * Math.exp(-decayRate * elapsed)
    const after = raw < DECAY_FLOOR ? 0 : raw

    if (after < before) {
      notes.push(
        `Temporal decay: ${f.id} ${before.toFixed(3)} → ${after.toFixed(3)} (elapsed=${elapsed}, rate=${decayRate})`,
      )
    }

    return {
      ...f,
      strength: after,
      lastFiredTurn: currentTurn,
      decayRate,
    }
  })

  if (notes.length === 0) {
    notes.push('Temporal decay: no features decayed this turn')
  }

  return { features: decayed, debugNotes: notes }
}
