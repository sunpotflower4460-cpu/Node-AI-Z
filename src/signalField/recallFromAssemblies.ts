import type { SignalFieldState, ActivationEvent } from './signalFieldTypes'

export type RecallResult = {
  state: SignalFieldState
  recalledAssemblyIds: string[]
  recallEvents: ActivationEvent[]
}

export function recallFromAssemblies(state: SignalFieldState, triggerAssemblyId: string, timestamp: number): RecallResult {
  const trigger = state.assemblies.find(a => a.id === triggerAssemblyId)
  if (!trigger) return { state, recalledAssemblyIds: [], recallEvents: [] }

  // Find bridges involving this assembly
  const bridges = state.crossModalBridges.filter(
    b => (b.sourceAssemblyId === triggerAssemblyId || b.targetAssemblyId === triggerAssemblyId) &&
      (b.stage === 'reinforced' || b.stage === 'promoted'),
  )

  const recalledAssemblyIds: string[] = []
  const recallEvents: ActivationEvent[] = []
  const particlesToActivate = new Set<string>()

  for (const bridge of bridges) {
    const otherAssemblyId = bridge.sourceAssemblyId === triggerAssemblyId ? bridge.targetAssemblyId : bridge.sourceAssemblyId
    const otherAssembly = state.assemblies.find(a => a.id === otherAssemblyId)
    if (!otherAssembly) continue
    recalledAssemblyIds.push(otherAssemblyId)
    for (const pid of otherAssembly.particleIds) {
      particlesToActivate.add(pid)
    }
  }

  const particles = state.particles.map(p => {
    if (!particlesToActivate.has(p.id)) return p
    if (p.refractory > 0) return p
    const newActivation = Math.min(1, p.activation + 0.4)
    recallEvents.push({ particleId: p.id, strength: newActivation, source: 'replay', timestamp })
    return { ...p, activation: newActivation }
  })

  return {
    state: { ...state, particles, recentActivations: [...state.recentActivations, ...recallEvents].slice(-500) },
    recalledAssemblyIds,
    recallEvents,
  }
}
