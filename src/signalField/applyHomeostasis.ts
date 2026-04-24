import type { SignalFieldState } from './signalFieldTypes'

const TARGET_ACTIVITY = 0.1
const THRESHOLD_NUDGE = 0.01

export function applyHomeostasis(state: SignalFieldState): SignalFieldState {
  const activeCount = state.particles.filter(p => p.activation > 0.1).length
  const activityRatio = activeCount / state.particles.length
  const delta = activityRatio > TARGET_ACTIVITY ? THRESHOLD_NUDGE : -THRESHOLD_NUDGE
  const particles = state.particles.map(p => ({
    ...p,
    threshold: Math.max(0.1, Math.min(0.9, p.threshold + delta)),
  }))
  return { ...state, particles }
}
