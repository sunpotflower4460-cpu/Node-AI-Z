import type { SignalFieldState, ParticlePoint } from './signalFieldTypes'

export const STABLE_PARTICLE_COUNT = 1000

// Simple deterministic LCG seeded random
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function createStableParticleField(): SignalFieldState {
  const rand = seededRandom(42)
  const particles: ParticlePoint[] = []
  for (let i = 0; i < STABLE_PARTICLE_COUNT; i++) {
    particles.push({
      id: `p${i}`,
      x: rand(),
      y: rand(),
      z: 0,
      activation: 0,
      threshold: 0.3,
      refractory: 0,
      decayRate: 0.05,
    })
  }
  return {
    particles,
    links: [],
    recentActivations: [],
    assemblies: [],
    protoMeanings: [],
    crossModalBridges: [],
    frameCount: 0,
  }
}
