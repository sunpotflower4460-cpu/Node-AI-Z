import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { buildSignalFieldSummary } from '../buildSignalFieldSummary'
import type { ProtoMeaningSeed, MixedLatentSeed } from '../signalFieldTypes'

describe('buildSignalFieldSummary', () => {
  it('returns correct counts for empty state', () => {
    const state = createStableParticleField()
    const summary = buildSignalFieldSummary(state, [], [], false)
    expect(summary.activeParticleCount).toBe(0)
    expect(summary.assemblyCount).toBe(0)
    expect(summary.protoMeaningSeedCount).toBe(0)
    expect(summary.mixedLatentSeedCount).toBe(0)
    expect(summary.bridgeCount).toBe(0)
    expect(summary.replayTriggered).toBe(false)
  })

  it('counts active particles correctly', () => {
    const state = createStableParticleField()
    const stateWithActive = {
      ...state,
      particles: [
        { ...state.particles[0]!, activation: 0.8 },
        { ...state.particles[1]!, activation: 0.05 }, // below threshold
      ],
    }
    const summary = buildSignalFieldSummary(stateWithActive, [], [], false)
    expect(summary.activeParticleCount).toBe(1)
  })

  it('reflects proto seed and mixed latent seed counts', () => {
    const state = createStableParticleField()
    const protoSeeds: ProtoMeaningSeed[] = [
      { id: 's1', sourceAssemblyIds: [], strength: 0.5, seedType: 'assembly_cluster', features: [] },
      { id: 's2', sourceAssemblyIds: [], strength: 0.3, seedType: 'replay_cluster', features: [] },
    ]
    const mixedSeeds: MixedLatentSeed[] = [
      { id: 'm1', sourceSeedIds: ['s1'], weight: 0.6, axes: { repetition: 0.5 } },
    ]
    const summary = buildSignalFieldSummary(state, protoSeeds, mixedSeeds, true)
    expect(summary.protoMeaningSeedCount).toBe(2)
    expect(summary.mixedLatentSeedCount).toBe(1)
    expect(summary.replayTriggered).toBe(true)
  })

  it('is embeddable in CrystallizedThinkingResult shape', () => {
    const state = createStableParticleField()
    const summary = buildSignalFieldSummary(state, [], [], false)
    // Verify it matches the CrystallizedThinkingResult.signalFieldSummary type shape
    expect(typeof summary.activeParticleCount).toBe('number')
    expect(typeof summary.assemblyCount).toBe('number')
    expect(typeof summary.protoMeaningSeedCount).toBe('number')
    expect(typeof summary.mixedLatentSeedCount).toBe('number')
    expect(typeof summary.bridgeCount).toBe('number')
    expect(typeof summary.replayTriggered).toBe('boolean')
  })
})
