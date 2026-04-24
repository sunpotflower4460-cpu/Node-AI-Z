import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'
import { detectAssemblies } from '../detectAssemblies'

describe('detectAssemblies', () => {
  it('detects assemblies from co-activated particles', () => {
    let state = createStableParticleField()
    const allEvents = []
    for (let i = 0; i < 5; i++) {
      const { state: s, events } = igniteParticles(state, {
        modality: 'text',
        vector: [0.5, 0.5],
        strength: 1.0,
        timestamp: i * 50,
      })
      state = s
      allEvents.push(...events)
    }
    state = detectAssemblies(state, allEvents)
    expect(state.assemblies.length).toBeGreaterThan(0)
  })
})
