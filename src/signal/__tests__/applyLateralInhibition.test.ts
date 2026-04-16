import { describe, it, expect } from 'vitest'
import { applyLateralInhibition } from '../applyLateralInhibition'
import type { ChunkFeature } from '../chunkTypes'

const makeFeature = (id: string, strength: number): ChunkFeature => ({
  id,
  strength,
  rawStrength: strength,
  sourceChunkIndices: [0],
})

describe('applyLateralInhibition', () => {
  it('returns features unchanged for single-element input', () => {
    const features = [makeFeature('motivation_drop', 0.8)]
    const { features: out } = applyLateralInhibition(features)
    expect(out[0].strength).toBe(0.8)
  })

  it('returns features unchanged for empty input', () => {
    const { features: out } = applyLateralInhibition([])
    expect(out).toHaveLength(0)
  })

  it('winner strength is unchanged', () => {
    const features = [
      makeFeature('motivation_drop', 0.9),
      makeFeature('monotony', 0.6),
      makeFeature('distress_signal', 0.5),
    ]
    const { features: out } = applyLateralInhibition(features)
    const winner = out.find((f) => f.id === 'motivation_drop')!
    expect(winner.strength).toBe(0.9)
  })

  it('non-winners are slightly reduced', () => {
    const features = [
      makeFeature('motivation_drop', 0.9),
      makeFeature('monotony', 0.6),
      makeFeature('distress_signal', 0.5),
    ]
    const { features: out } = applyLateralInhibition(features)
    const monotony = out.find((f) => f.id === 'monotony')!
    const distress = out.find((f) => f.id === 'distress_signal')!
    expect(monotony.strength).toBeLessThan(0.6)
    expect(distress.strength).toBeLessThan(0.5)
  })

  it('reduction is small (winner-take-more, not winner-take-all)', () => {
    const features = [
      makeFeature('motivation_drop', 0.8),
      makeFeature('monotony', 0.7),
    ]
    const { features: out } = applyLateralInhibition(features)
    const monotony = out.find((f) => f.id === 'monotony')!
    // reduction = 0.8 × 0.05 = 0.04
    expect(0.7 - monotony.strength).toBeCloseTo(0.04, 5)
  })

  it('strength is never negative', () => {
    const features = [
      makeFeature('motivation_drop', 1.0),
      makeFeature('hope_signal', 0.001),
    ]
    const { features: out } = applyLateralInhibition(features)
    out.forEach((f) => expect(f.strength).toBeGreaterThanOrEqual(0))
  })

  it('returns debugNotes including winner info', () => {
    const features = [
      makeFeature('motivation_drop', 0.9),
      makeFeature('monotony', 0.5),
    ]
    const { debugNotes } = applyLateralInhibition(features)
    expect(debugNotes.some((n) => n.includes('winner=motivation_drop'))).toBe(true)
  })

  it('preserves all feature ids', () => {
    const features = [
      makeFeature('a', 0.9),
      makeFeature('b', 0.7),
      makeFeature('c', 0.5),
    ]
    const { features: out } = applyLateralInhibition(features)
    expect(out.map((f) => f.id).sort()).toEqual(['a', 'b', 'c'])
  })
})
