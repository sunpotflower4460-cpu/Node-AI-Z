import { describe, expect, it } from 'vitest'
import { updateMultiTimescaleWeights } from '../updateMultiTimescaleWeights'
import { decayTimescaleWeights } from '../decayTimescaleWeights'
import { computeEffectiveSignalWeight } from '../computeEffectiveSignalWeight'

describe('signalPlasticity', () => {
  it('separates short, mid, and long term weight updates', () => {
    const updated = updateMultiTimescaleWeights({
      records: [],
      reinforcements: [{ targetType: 'assembly', targetId: 'assembly_a', intensity: 0.9 }],
      learningRateMultiplier: 1,
      timestamp: 1000,
    })

    expect(updated[0]?.weights.shortTerm).toBeGreaterThan(updated[0]?.weights.longTerm ?? 0)
    expect(computeEffectiveSignalWeight(updated[0]!.weights)).toBeGreaterThan(0)
  })

  it('decays faster short-term traces over time', () => {
    const decayed = decayTimescaleWeights(
      [
        {
          id: 'plasticity_assembly_assembly_a',
          targetType: 'assembly',
          targetId: 'assembly_a',
          reinforcementCount: 1,
          weights: { shortTerm: 0.8, midTerm: 0.6, longTerm: 0.4, lastUpdatedAt: 1000 },
        },
      ],
      6000,
    )

    expect(decayed[0]?.weights.shortTerm).toBeLessThan(0.8)
    expect(decayed[0]?.weights.midTerm).toBeLessThan(0.6)
    expect(decayed[0]?.weights.longTerm).toBeGreaterThan(0)
  })
})
