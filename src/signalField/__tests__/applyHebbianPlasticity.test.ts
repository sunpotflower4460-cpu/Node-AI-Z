import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'
import { applyHebbianPlasticity } from '../applyHebbianPlasticity'

describe('applyHebbianPlasticity', () => {
  it('creates links between co-activated particles', () => {
    const state = createStableParticleField()
    const { state: s1, events } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    const s2 = applyHebbianPlasticity(s1, events)
    expect(s2.links.length).toBeGreaterThan(0)
  })

  it('strengthens existing links on repeated co-activation', () => {
    const state = createStableParticleField()
    const { state: s1, events: e1 } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    const s2 = applyHebbianPlasticity(s1, e1)
    const { state: s3, events: e2 } = igniteParticles(s2, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 150,
    })
    const s4 = applyHebbianPlasticity(s3, [...e1, ...e2])
    const avgWeightBefore = s2.links.reduce((sum, l) => sum + l.weight, 0) / (s2.links.length || 1)
    const avgWeightAfter = s4.links.reduce((sum, l) => sum + l.weight, 0) / (s4.links.length || 1)
    expect(avgWeightAfter).toBeGreaterThanOrEqual(avgWeightBefore)
  })
})
