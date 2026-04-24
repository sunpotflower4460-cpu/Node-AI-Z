import type { SignalFieldState } from './signalFieldTypes'

export function applyRefractory(state: SignalFieldState): SignalFieldState {
  const particles = state.particles.map(p => {
    if (p.refractory <= 0) return p
    return { ...p, refractory: Math.max(0, p.refractory - 1) }
  })
  return { ...state, particles }
}
