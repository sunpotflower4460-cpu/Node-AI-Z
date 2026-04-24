import type { SignalFieldState, ParticleStimulus, ActivationEvent } from './signalFieldTypes'

export type IgniteResult = {
  state: SignalFieldState
  events: ActivationEvent[]
}

export function igniteParticles(state: SignalFieldState, stimulus: ParticleStimulus): IgniteResult {
  const events: ActivationEvent[] = []
  const particles = state.particles.map(p => {
    if (p.refractory > 0) return p
    // similarity: use dot-product-like scoring against stimulus.vector using particle position
    const px = p.x
    const py = p.y
    const pz = p.z ?? 0
    const vx = stimulus.vector[0] ?? 0.5
    const vy = stimulus.vector[1] ?? 0.5
    const vz = stimulus.vector[2] ?? 0
    const dx = px - vx
    const dy = py - vy
    const dz = pz - vz
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const similarity = Math.max(0, 1 - dist * 2)
    const excitation = similarity * stimulus.strength
    if (excitation > p.threshold) {
      const newActivation = Math.min(1, p.activation + excitation)
      events.push({ particleId: p.id, strength: newActivation, source: 'stimulus', timestamp: stimulus.timestamp })
      return { ...p, activation: newActivation, refractory: 3 }
    }
    return p
  })
  return {
    state: {
      ...state,
      particles,
      recentActivations: [...state.recentActivations, ...events].slice(-500),
    },
    events,
  }
}
