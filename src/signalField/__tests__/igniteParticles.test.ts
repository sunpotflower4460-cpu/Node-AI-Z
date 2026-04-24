import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'

describe('igniteParticles', () => {
  it('fires particles near the stimulus vector', () => {
    const state = createStableParticleField()
    const { events } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    expect(events.length).toBeGreaterThan(0)
    expect(events.every(e => e.source === 'stimulus')).toBe(true)
  })

  it('does not fire refractory particles', () => {
    const state = createStableParticleField()
    // First ignition
    const { state: s1 } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    // Immediately re-ignite
    const { events: events2 } = igniteParticles(s1, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 101,
    })
    // Some particles should be refractory and not fire again
    const firedIds = new Set(events2.map(e => e.particleId))
    const refractoryFired = s1.particles.filter(p => p.refractory > 0 && firedIds.has(p.id))
    expect(refractoryFired).toHaveLength(0)
  })
})
