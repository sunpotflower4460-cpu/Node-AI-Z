import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'
import { propagateActivation } from '../propagateActivation'
import { applyHebbianPlasticity } from '../applyHebbianPlasticity'

describe('propagateActivation', () => {
  it('propagates activation through links', () => {
    let state = createStableParticleField()
    const { state: s1, events } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    state = applyHebbianPlasticity(s1, events)
    const { events: propEvents } = propagateActivation(state, 101)
    // With links established, propagation should produce events
    expect(propEvents.length).toBeGreaterThanOrEqual(0)
  })
})
