import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { deriveProtoMeaningSeeds } from '../deriveProtoMeaningSeeds'
import type { Assembly, ProtoMeaning, CrossModalBridge, SignalFieldState } from '../signalFieldTypes'

function makeState(overrides: Partial<SignalFieldState> = {}): SignalFieldState {
  return { ...createStableParticleField(), ...overrides }
}

describe('deriveProtoMeaningSeeds', () => {
  it('returns empty array for empty state', () => {
    const seeds = deriveProtoMeaningSeeds(makeState())
    expect(seeds).toEqual([])
  })

  it('creates assembly_cluster seeds from assemblies', () => {
    const assembly: Assembly = {
      id: 'asm1',
      particleIds: ['p0', 'p1', 'p2'],
      recurrenceCount: 3,
      averageCoactivation: 0.7,
      lastActivatedAt: 100,
    }
    const seeds = deriveProtoMeaningSeeds(makeState({ assemblies: [assembly] }))
    expect(seeds.length).toBeGreaterThan(0)
    const seed = seeds.find(s => s.seedType === 'assembly_cluster')
    expect(seed).toBeDefined()
    expect(seed!.sourceAssemblyIds).toContain('asm1')
    expect(seed!.strength).toBeGreaterThan(0)
  })

  it('tags repeated_cluster for high-recurrence assemblies', () => {
    const assembly: Assembly = {
      id: 'asm2',
      particleIds: ['p0', 'p1', 'p2'],
      recurrenceCount: 4,
      averageCoactivation: 0.9,
      lastActivatedAt: 100,
    }
    const seeds = deriveProtoMeaningSeeds(makeState({ assemblies: [assembly] }))
    const seed = seeds.find(s => s.seedType === 'assembly_cluster')!
    expect(seed.features).toContain('repeated_cluster')
  })

  it('tags high_replay_recurrence for recurrenceCount >= 5', () => {
    const assembly: Assembly = {
      id: 'asm3',
      particleIds: ['p0', 'p1', 'p2'],
      recurrenceCount: 6,
      averageCoactivation: 0.8,
      lastActivatedAt: 100,
    }
    const seeds = deriveProtoMeaningSeeds(makeState({ assemblies: [assembly] }))
    const seed = seeds.find(s => s.seedType === 'assembly_cluster')!
    expect(seed.features).toContain('high_replay_recurrence')
  })

  it('creates bridge_cluster seeds from cross-modal bridges', () => {
    const assembly1: Assembly = { id: 'a1', particleIds: ['p0'], recurrenceCount: 1, averageCoactivation: 0.7, lastActivatedAt: 1 }
    const assembly2: Assembly = { id: 'a2', particleIds: ['p1'], recurrenceCount: 1, averageCoactivation: 0.7, lastActivatedAt: 1 }
    const bridge: CrossModalBridge = {
      id: 'bridge1',
      sourceAssemblyId: 'a1',
      targetAssemblyId: 'a2',
      confidence: 0.8,
      stage: 'reinforced',
      createdAt: 1,
    }
    const seeds = deriveProtoMeaningSeeds(makeState({ assemblies: [assembly1, assembly2], crossModalBridges: [bridge] }))
    const bridgeSeed = seeds.find(s => s.seedType === 'bridge_cluster')
    expect(bridgeSeed).toBeDefined()
    expect(bridgeSeed!.features).toContain('cross_modal_same_object')
  })

  it('creates replay_cluster seeds from proto meanings', () => {
    const proto: ProtoMeaning = {
      id: 'proto1',
      assemblyIds: ['a1'],
      strength: 2.5,
      promotedAt: 100,
    }
    const seeds = deriveProtoMeaningSeeds(makeState({ protoMeanings: [proto] }))
    const replaySeed = seeds.find(s => s.seedType === 'replay_cluster')
    expect(replaySeed).toBeDefined()
    expect(replaySeed!.sourceProtoMeaningIds).toContain('proto1')
  })

  it('does not assign high-level meaning labels', () => {
    const assembly: Assembly = { id: 'a1', particleIds: ['p0'], recurrenceCount: 3, averageCoactivation: 0.8, lastActivatedAt: 1 }
    const seeds = deriveProtoMeaningSeeds(makeState({ assemblies: [assembly] }))
    const forbiddenLabels = ['sadness', 'fatigue', 'conflict', 'practical_advice', 'joy', 'anger']
    for (const seed of seeds) {
      for (const label of forbiddenLabels) {
        expect(seed.features).not.toContain(label)
      }
    }
  })
})
