import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { igniteParticles } from '../igniteParticles'
import { runReplayCycle } from '../runReplayCycle'

describe('runReplayCycle', () => {
  it('generates replay events from recent activations', () => {
    const state = createStableParticleField()
    const { state: s1 } = igniteParticles(state, {
      modality: 'text',
      vector: [0.5, 0.5],
      strength: 1.0,
      timestamp: 100,
    })
    const { replayEvents } = runReplayCycle(s1, 200)
    expect(replayEvents.length).toBeGreaterThan(0)
    expect(replayEvents.every(e => e.source === 'replay')).toBe(true)
  })
})
