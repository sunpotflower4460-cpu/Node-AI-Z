import { describe, it, expect } from 'vitest'
import { createStableParticleField, STABLE_PARTICLE_COUNT } from '../createStableParticleField'

describe('createStableParticleField', () => {
  it('creates the expected number of particles', () => {
    const state = createStableParticleField()
    expect(state.particles).toHaveLength(STABLE_PARTICLE_COUNT)
  })

  it('produces stable (deterministic) positions', () => {
    const a = createStableParticleField()
    const b = createStableParticleField()
    expect(a.particles[0]?.x).toBe(b.particles[0]?.x)
    expect(a.particles[0]?.y).toBe(b.particles[0]?.y)
    expect(a.particles[99]?.x).toBe(b.particles[99]?.x)
  })

  it('starts with zero activation and empty collections', () => {
    const state = createStableParticleField()
    expect(state.particles.every(p => p.activation === 0)).toBe(true)
    expect(state.links).toHaveLength(0)
    expect(state.assemblies).toHaveLength(0)
    expect(state.protoMeanings).toHaveLength(0)
    expect(state.crossModalBridges).toHaveLength(0)
  })
})
