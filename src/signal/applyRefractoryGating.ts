type RefractoryEntity = {
  id: string
  strength: number
  refractoryUntilTurn?: number
}

/**
 * Refractory scale range applied when an entity is in its refractory period.
 * 0.3 means "only 30 % of normal strength fires through".
 */
const REFRACTORY_SCALE_MIN = 0.3
const REFRACTORY_SCALE_MAX = 0.7

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
 * Apply refractory gating to feature or cue activations.
 *
 * Entities whose `refractoryUntilTurn` is ≥ `currentTurn` are in their
 * refractory period and have their strength scaled down (not zeroed).
 *
 * After processing, `refractoryUntilTurn` is updated to reflect how long
 * the current firing will keep the entity in its refractory state:
 *   nextRefractory = currentTurn + max(1, round(strength × MAX_REFRACTORY_TURNS))
 *
 * Stronger entities naturally take a little longer to recover.
 */
export const applyRefractoryGating = <T extends RefractoryEntity>(
  features: T[],
  currentTurn: number,
): { features: T[]; debugNotes: string[] } => {
  const notes: string[] = []

  const gated = features.map((f): T => {
    const refractoryUntil = f.refractoryUntilTurn ?? -Infinity
    const inRefractory = currentTurn < refractoryUntil
    const refractoryRemaining = Math.max(0, refractoryUntil - currentTurn)
    const refractoryPhase = Math.min(1, refractoryRemaining / MAX_REFRACTORY_TURNS)
    const scale = inRefractory
      ? Math.max(
          REFRACTORY_SCALE_MIN,
          REFRACTORY_SCALE_MAX - refractoryPhase * (REFRACTORY_SCALE_MAX - REFRACTORY_SCALE_MIN),
        )
      : 1

    const scaledStrength = inRefractory ? f.strength * scale : f.strength

    if (inRefractory) {
      notes.push(
        `Refractory: ${f.id} gated (untilTurn=${refractoryUntil}, scale=${scale.toFixed(2)}, strength ${f.strength.toFixed(3)} → ${scaledStrength.toFixed(3)})`,
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
