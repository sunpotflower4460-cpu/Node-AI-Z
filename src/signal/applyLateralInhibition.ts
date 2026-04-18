type Inhibitable = {
  id: string
  strength: number
}

/**
 * Fraction of the winner's strength used as an inhibitory push-down.
 * 0.05 ≈ "winner-take-more", not "winner-take-all".
 */
const INHIBITION_FACTOR = 0.05

/**
 * Apply lateral inhibition to a set of features.
 *
 * The strongest (winner) feature is identified.  Every other feature has
 * its strength reduced by a small fraction of the winner's strength:
 *
 *   reduction = winner.strength × INHIBITION_FACTOR
 *
 * The winner itself is untouched.  No feature is reduced below 0.
 *
 * Intent: winner-take-more, not winner-take-all.  The strongest signal
 * slightly foregrounds itself without erasing the rest.
 */
export const applyLateralInhibition = <T extends Inhibitable>(
  features: T[],
): { features: T[]; debugNotes: string[] } => {
  if (features.length <= 1) {
    return {
      features,
      debugNotes: ['Lateral inhibition: single feature or empty — skipped'],
    }
  }

  const sorted = [...features].sort((a, b) => b.strength - a.strength)
  const winner = sorted[0]
  const reduction = winner.strength * INHIBITION_FACTOR
  const notes: string[] = [
    `Lateral inhibition: winner=${winner.id}(${winner.strength.toFixed(3)}), reduction=${reduction.toFixed(4)}`,
  ]

  const inhibited = features.map((f): T => {
    if (f.id === winner.id) return f
    const before = f.strength
    const after = Math.max(0, before - reduction)
    if (after < before) {
      notes.push(`  ${f.id}: ${before.toFixed(3)} → ${after.toFixed(3)}`)
    }
    return { ...f, strength: after }
  })

  return { features: inhibited, debugNotes: notes }
}
