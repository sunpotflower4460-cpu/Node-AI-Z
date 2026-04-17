import type { ChunkFeature } from './ingest/chunkTypes'

/**
 * Refractory scale applied when a feature is in its refractory period.
 * 0.3 means "only 30 % of normal strength fires through".
 */
const REFRACTORY_SCALE = 0.3

/**
 * Refractory duration added per unit of feature strength.
 *
 * A feature with strength 0.9 gets a refractory period of
 *   ceil(0.9 × MAX_REFRACTORY_TURNS) turns ≈ 2 turns (at max=2).
 *
 * Stronger features cool down a bit longer than weak ones, but the
 * effect is mild rather than a full block.
 */
const MAX_REFRACTORY_TURNS = 2

/**
 * Apply refractory gating to feature activations.
 *
 * Features whose `refractoryUntilTurn` is ≥ `currentTurn` are in their
 * refractory period and have their strength scaled down (not zeroed).
 *
 * After processing, `refractoryUntilTurn` is updated to reflect how long
 * the current firing will keep the feature in its refractory state:
 *   nextRefractory = currentTurn + max(1, round(strength × MAX_REFRACTORY_TURNS))
 *
 * Stronger features naturally take a little longer to recover.
 */
export const applyRefractoryGating = (
  features: ChunkFeature[],
  currentTurn: number,
): { features: ChunkFeature[]; debugNotes: string[] } => {
  const notes: string[] = []

  const gated = features.map((f): ChunkFeature => {
    const refractoryUntil = f.refractoryUntilTurn ?? -Infinity
    const inRefractory = currentTurn < refractoryUntil

    const scaledStrength = inRefractory
      ? f.strength * REFRACTORY_SCALE
      : f.strength

    if (inRefractory) {
      notes.push(
        `Refractory: ${f.id} gated (refractoryUntilTurn=${refractoryUntil}, strength ${f.strength.toFixed(3)} → ${scaledStrength.toFixed(3)})`,
      )
    }

    // Compute the new refractory window based on the (pre-scale) strength
    const refractoryDuration = Math.max(
      1,
      Math.round(f.strength * MAX_REFRACTORY_TURNS),
    )
    const nextRefractoryUntilTurn = currentTurn + refractoryDuration

    return {
      ...f,
      strength: scaledStrength,
      refractoryUntilTurn: nextRefractoryUntilTurn,
    }
  })

  if (notes.length === 0) {
    notes.push('Refractory: no features gated this turn')
  }

  return { features: gated, debugNotes: notes }
}
