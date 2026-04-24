import type { SignalFieldState, ActivationEvent } from './signalFieldTypes'

export function propagateActivation(state: SignalFieldState, timestamp: number): { state: SignalFieldState; events: ActivationEvent[] } {
  const events: ActivationEvent[] = []
  const activationMap = new Map<string, number>()
  for (const p of state.particles) {
    if (p.activation > 0) activationMap.set(p.id, p.activation)
  }
  const addedActivation = new Map<string, number>()
  for (const link of state.links) {
    const srcActivation = activationMap.get(link.sourceId) ?? 0
    if (srcActivation <= 0) continue
    const propagated = srcActivation * link.weight * 0.5
    if (propagated < 0.01) continue
    addedActivation.set(link.targetId, (addedActivation.get(link.targetId) ?? 0) + propagated)
  }
  const particles = state.particles.map(p => {
    const added = addedActivation.get(p.id) ?? 0
    if (added <= 0 || p.refractory > 0) return p
    const newActivation = Math.min(1, p.activation + added)
    if (newActivation > p.threshold) {
      events.push({ particleId: p.id, strength: newActivation, source: 'propagation', timestamp })
    }
    return { ...p, activation: newActivation }
  })
  return {
    state: { ...state, particles, recentActivations: [...state.recentActivations, ...events].slice(-500) },
    events,
  }
}
