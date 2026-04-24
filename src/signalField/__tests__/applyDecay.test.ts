import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'
import { applyHebbianPlasticity } from '../applyHebbianPlasticity'
import { applyDecay } from '../applyDecay'

describe('applyDecay', () => {
  it('reduces particle activation over time', () => {
    const state = createStableParticleField()
    const { state: s1, events } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    const s2 = applyDecay(s1)
    const totalBefore = s1.particles.reduce((sum, p) => sum + p.activation, 0)
    const totalAfter = s2.particles.reduce((sum, p) => sum + p.activation, 0)
    expect(totalAfter).toBeLessThan(totalBefore)
    // avoid unused variable warning
    expect(events.length).toBeGreaterThanOrEqual(0)
  })

  it('removes very weak links', () => {
    const state = createStableParticleField()
    const { state: s1, events } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    let s2 = applyHebbianPlasticity(s1, events)
    // Apply decay many times to remove weak links
    for (let i = 0; i < 200; i++) {
      s2 = applyDecay(s2)
    }
    expect(s2.links.length).toBeLessThan(s1.links.length + 1)
  })
})
