import type { SignalFieldState } from './signalFieldTypes'

const LINK_DECAY = 0.001
const MIN_LINK_WEIGHT = 0.01

export function applyDecay(state: SignalFieldState): SignalFieldState {
  const particles = state.particles.map(p => ({
    ...p,
    activation: Math.max(0, p.activation - p.decayRate),
  }))
  const links = state.links
    .map(link => ({ ...link, weight: link.weight - LINK_DECAY }))
    .filter(link => link.weight >= MIN_LINK_WEIGHT)
  return { ...state, particles, links }
}
