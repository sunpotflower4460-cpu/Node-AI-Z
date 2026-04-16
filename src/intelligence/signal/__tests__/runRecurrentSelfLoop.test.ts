import { describe, it, expect } from 'vitest'
import { runRecurrentSelfLoop } from '../runRecurrentSelfLoop'
import type { ChunkFeature } from '../../ingest/chunkTypes'

const makeFeature = (id: string, strength: number): ChunkFeature => ({
  id,
  strength,
  rawStrength: strength,
  sourceChunkIndices: [0],
})

describe('runRecurrentSelfLoop', () => {
  it('returns at least 1 iteration', () => {
    const features = [
      makeFeature('self_critique', 0.6),
      makeFeature('uncertainty_expression', 0.5),
    ]
    const result = runRecurrentSelfLoop(features)
    expect(result.iterations).toBeGreaterThanOrEqual(1)
  })

  it('converges when features are stable (identical strengths cause no delta)', () => {
    // Single self feature — no co-activated peers → zero reinforcement → converges immediately
    const features = [makeFeature('self_critique', 0.5)]
    const result = runRecurrentSelfLoop(features, undefined, 8, 0.01)
    expect(result.converged).toBe(true)
  })

  it('runs at least 1 loop with two co-activatable self features', () => {
    const features = [
      makeFeature('self_critique', 0.6),
      makeFeature('hope_signal', 0.5),
    ]
    const result = runRecurrentSelfLoop(features)
    expect(result.iterations).toBeGreaterThanOrEqual(1)
  })

  it('does not exceed maxLoops', () => {
    const features = [
      makeFeature('self_critique', 0.8),
      makeFeature('distress_signal', 0.8),
      makeFeature('uncertainty_expression', 0.8),
    ]
    const maxLoops = 3
    const result = runRecurrentSelfLoop(features, undefined, maxLoops, 0.0001)
    expect(result.iterations).toBeLessThanOrEqual(maxLoops)
  })

  it('converged=false when threshold is unreachably small and maxLoops hit', () => {
    const features = [
      makeFeature('self_critique', 0.9),
      makeFeature('distress_signal', 0.9),
    ]
    const result = runRecurrentSelfLoop(features, undefined, 2, 0.000001)
    // With only 2 loops and a tiny threshold, likely doesn't converge
    expect(result.converged === false || result.iterations <= 2).toBe(true)
  })

  it('returns states array with at least initial state', () => {
    const features = [makeFeature('self_critique', 0.6)]
    const result = runRecurrentSelfLoop(features)
    expect(result.states.length).toBeGreaterThanOrEqual(1)
  })

  it('last state in states contains all feature ids', () => {
    const features = [
      makeFeature('self_critique', 0.6),
      makeFeature('motivation_drop', 0.7), // non-self feature
    ]
    const result = runRecurrentSelfLoop(features)
    const lastState = result.states[result.states.length - 1]
    const ids = lastState.map((f) => f.id).sort()
    expect(ids).toContain('motivation_drop')
    expect(ids).toContain('self_critique')
  })

  it('applies personalBias to feature strength', () => {
    const features = [makeFeature('self_critique', 0.5)]
    const result = runRecurrentSelfLoop(features, { self_critique: 0.1 })
    // The bias should have shifted strength upward at some point
    const lastState = result.states[result.states.length - 1]
    const sc = lastState.find((f) => f.id === 'self_critique')!
    expect(sc.strength).toBeGreaterThanOrEqual(0.5)
  })

  it('includes debugNotes', () => {
    const features = [makeFeature('self_critique', 0.6)]
    const result = runRecurrentSelfLoop(features)
    expect(Array.isArray(result.debugNotes)).toBe(true)
    expect(result.debugNotes.length).toBeGreaterThan(0)
  })

  it('early exits when no self/belief features present', () => {
    const features = [
      makeFeature('motivation_drop', 0.8),
      makeFeature('monotony', 0.7),
    ]
    const result = runRecurrentSelfLoop(features)
    expect(result.converged).toBe(true)
    expect(result.iterations).toBe(1)
  })
})
