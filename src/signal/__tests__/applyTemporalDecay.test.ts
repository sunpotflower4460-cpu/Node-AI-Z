import { describe, it, expect } from 'vitest'
import { applyTemporalDecay } from '../applyTemporalDecay'
import type { ChunkFeature } from '../ingest/chunkTypes'

const makeFeature = (id: string, strength: number, extra: Partial<ChunkFeature> = {}): ChunkFeature => ({
  id,
  strength,
  rawStrength: strength,
  sourceChunkIndices: [0],
  ...extra,
})

describe('applyTemporalDecay', () => {
  it('freshly fired features (no lastFiredTurn) are not decayed', () => {
    const features = [makeFeature('motivation_drop', 0.8)]
    const { features: out } = applyTemporalDecay(features, 0)
    expect(out[0].strength).toBe(0.8)
  })

  it('larger elapsed → more decay', () => {
    const f1 = makeFeature('motivation_drop', 0.8, { lastFiredTurn: 8 })
    const f2 = makeFeature('motivation_drop', 0.8, { lastFiredTurn: 3 })
    const { features: out1 } = applyTemporalDecay([f1], 10) // elapsed = 2
    const { features: out2 } = applyTemporalDecay([f2], 10) // elapsed = 7
    // More elapsed → more decay → lower strength: out2 (elapsed=7) < out1 (elapsed=2)
    expect(out2[0].strength).toBeLessThan(out1[0].strength)
  })

  it('strength decreases with elapsed > 0', () => {
    const features = [makeFeature('distress_signal', 0.7, { lastFiredTurn: 0 })]
    const { features: out } = applyTemporalDecay(features, 5)
    expect(out[0].strength).toBeLessThan(0.7)
    expect(out[0].strength).toBeGreaterThanOrEqual(0)
  })

  it('strength is never negative', () => {
    const features = [makeFeature('hope_signal', 0.4, { lastFiredTurn: 0 })]
    const { features: out } = applyTemporalDecay(features, 100)
    expect(out[0].strength).toBeGreaterThanOrEqual(0)
  })

  it('sets lastFiredTurn to currentTurn on output', () => {
    const features = [makeFeature('self_critique', 0.6)]
    const { features: out } = applyTemporalDecay(features, 7)
    expect(out[0].lastFiredTurn).toBe(7)
  })

  it('uses previousStates for lastFiredTurn when feature has none', () => {
    const features = [makeFeature('monotony', 0.8)]
    const prev = new Map([['monotony', { id: 'monotony', strength: 0.8, lastFiredTurn: 0, decayRate: 0.1, refractoryUntilTurn: -1 }]])
    const { features: out } = applyTemporalDecay(features, 5, prev)
    // elapsed = 5, should have decayed
    expect(out[0].strength).toBeLessThan(0.8)
  })

  it('very small values are zeroed out', () => {
    // With high decay rate and large elapsed, should reach floor
    const features = [makeFeature('temporal_contrast', 0.05, { lastFiredTurn: 0, decayRate: 0.5 })]
    const { features: out } = applyTemporalDecay(features, 20)
    expect(out[0].strength).toBe(0)
  })

  it('returns debugNotes array', () => {
    const features = [makeFeature('motivation_drop', 0.8, { lastFiredTurn: 0 })]
    const { debugNotes } = applyTemporalDecay(features, 3)
    expect(Array.isArray(debugNotes)).toBe(true)
    expect(debugNotes.length).toBeGreaterThan(0)
  })

  it('preserves all feature ids in output', () => {
    const features = [
      makeFeature('motivation_drop', 0.8),
      makeFeature('monotony', 0.6),
    ]
    const { features: out } = applyTemporalDecay(features, 2)
    expect(out.map((f) => f.id).sort()).toEqual(['monotony', 'motivation_drop'])
  })
})
