import { describe, it, expect } from 'vitest'
import { deriveMixedLatentSeeds } from '../deriveMixedLatentSeeds'
import type { ProtoMeaningSeed } from '../signalFieldTypes'

function makeSeed(overrides: Partial<ProtoMeaningSeed> = {}): ProtoMeaningSeed {
  return {
    id: 'seed1',
    sourceAssemblyIds: ['a1'],
    strength: 0.6,
    seedType: 'assembly_cluster',
    features: ['repeated_cluster'],
    ...overrides,
  }
}

describe('deriveMixedLatentSeeds', () => {
  it('returns empty array for empty input', () => {
    expect(deriveMixedLatentSeeds([])).toEqual([])
  })

  it('creates a mixed latent seed from assembly seeds', () => {
    const seeds = deriveMixedLatentSeeds([makeSeed()])
    expect(seeds.length).toBeGreaterThan(0)
    const seed = seeds[0]!
    expect(seed.sourceSeedIds).toContain('seed1')
    expect(seed.weight).toBeGreaterThan(0)
    expect(seed.axes).toBeDefined()
  })

  it('sets high repetition axis for repeated_cluster feature', () => {
    const seeds = deriveMixedLatentSeeds([
      makeSeed({ features: ['repeated_cluster', 'high_replay_recurrence'], strength: 0.8 }),
    ])
    const seed = seeds.find(s => s.sourceSeedIds.includes('seed1'))!
    expect(seed.axes.repetition).toBeGreaterThan(0.3)
  })

  it('sets high instability axis for unstable_scatter feature', () => {
    const seeds = deriveMixedLatentSeeds([
      makeSeed({ features: ['unstable_scatter'], strength: 0.7 }),
    ])
    const seed = seeds[0]!
    expect(seed.axes.instability).toBeGreaterThan(0.3)
  })

  it('creates a bridge seed with high crossModalBinding', () => {
    const bridgeSeed = makeSeed({ id: 'b1', seedType: 'bridge_cluster', features: ['cross_modal_same_object'], strength: 0.9 })
    const mixed = deriveMixedLatentSeeds([bridgeSeed])
    const seed = mixed.find(s => s.sourceSeedIds.includes('b1'))!
    expect(seed.axes.crossModalBinding).toBeGreaterThan(0.5)
  })

  it('creates a replay seed with repetition from replay_cluster', () => {
    const replaySeed = makeSeed({ id: 'r1', seedType: 'replay_cluster', features: ['focused_reactivation', 'high_replay_recurrence'], strength: 0.7 })
    const mixed = deriveMixedLatentSeeds([replaySeed])
    const seed = mixed.find(s => s.sourceSeedIds.includes('r1'))!
    expect(seed.axes.repetition).toBeGreaterThan(0.3)
  })

  it('axes are bounded [0, 1]', () => {
    const seeds = deriveMixedLatentSeeds([
      makeSeed({ strength: 1.0, features: ['repeated_cluster', 'high_replay_recurrence', 'dense_local_binding', 'hub_like_activity'] }),
    ])
    for (const seed of seeds) {
      for (const val of Object.values(seed.axes)) {
        if (val !== undefined) {
          expect(val).toBeGreaterThanOrEqual(0)
          expect(val).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('does not assign final meaning labels', () => {
    const seeds = deriveMixedLatentSeeds([makeSeed()])
    const forbidden = ['sadness', 'joy', 'anger', 'conflict', 'practical_advice']
    for (const seed of seeds) {
      expect(forbidden.some(f => seed.id.includes(f))).toBe(false)
    }
  })
})
