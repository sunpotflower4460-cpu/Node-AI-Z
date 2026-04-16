import { describe, it, expect } from 'vitest'
import { applyRefractoryGating } from '../applyRefractoryGating'
import type { ChunkFeature } from '../../ingest/chunkTypes'

const makeFeature = (id: string, strength: number, extra: Partial<ChunkFeature> = {}): ChunkFeature => ({
  id,
  strength,
  rawStrength: strength,
  sourceChunkIndices: [0],
  ...extra,
})

describe('applyRefractoryGating', () => {
  it('feature not in refractory is unchanged', () => {
    const features = [makeFeature('motivation_drop', 0.8, { refractoryUntilTurn: -1 })]
    const { features: out } = applyRefractoryGating(features, 5)
    expect(out[0].strength).toBe(0.8)
  })

  it('feature in refractory has reduced strength', () => {
    const features = [makeFeature('distress_signal', 0.8, { refractoryUntilTurn: 10 })]
    const { features: out } = applyRefractoryGating(features, 5)
    expect(out[0].strength).toBeLessThan(0.8)
  })

  it('refractory reduction is approximately 0.3x of original', () => {
    const features = [makeFeature('self_critique', 0.8, { refractoryUntilTurn: 10 })]
    const { features: out } = applyRefractoryGating(features, 5)
    expect(out[0].strength).toBeCloseTo(0.8 * 0.3, 5)
  })

  it('strength is never negative', () => {
    const features = [makeFeature('hope_signal', 0.1, { refractoryUntilTurn: 100 })]
    const { features: out } = applyRefractoryGating(features, 1)
    expect(out[0].strength).toBeGreaterThanOrEqual(0)
  })

  it('sets refractoryUntilTurn to a future turn', () => {
    const features = [makeFeature('monotony', 0.7)]
    const { features: out } = applyRefractoryGating(features, 3)
    expect(out[0].refractoryUntilTurn).toBeGreaterThan(3)
  })

  it('stronger features get longer refractory period', () => {
    const strong = [makeFeature('motivation_drop', 0.9)]
    const weak = [makeFeature('hope_signal', 0.2)]
    const { features: outStrong } = applyRefractoryGating(strong, 0)
    const { features: outWeak } = applyRefractoryGating(weak, 0)
    expect(outStrong[0].refractoryUntilTurn!).toBeGreaterThanOrEqual(outWeak[0].refractoryUntilTurn!)
  })

  it('returns debugNotes when feature is in refractory', () => {
    const features = [makeFeature('distress_signal', 0.8, { refractoryUntilTurn: 10 })]
    const { debugNotes } = applyRefractoryGating(features, 5)
    expect(debugNotes.some((n) => n.includes('Refractory'))).toBe(true)
    expect(debugNotes.some((n) => n.includes('distress_signal'))).toBe(true)
  })

  it('returns default note when no features gated', () => {
    const features = [makeFeature('motivation_drop', 0.8)]
    const { debugNotes } = applyRefractoryGating(features, 5)
    expect(debugNotes.some((n) => n.includes('no features gated'))).toBe(true)
  })

  it('preserves all feature ids', () => {
    const features = [
      makeFeature('motivation_drop', 0.8),
      makeFeature('monotony', 0.6, { refractoryUntilTurn: 10 }),
    ]
    const { features: out } = applyRefractoryGating(features, 5)
    expect(out.map((f) => f.id).sort()).toEqual(['monotony', 'motivation_drop'])
  })
})
