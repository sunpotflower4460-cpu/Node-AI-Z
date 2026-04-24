import type { SignalFieldState, ActivationEvent } from './signalFieldTypes'

const REPLAY_STRENGTH = 0.5
const REPLAY_WINDOW = 500

export function runReplayCycle(state: SignalFieldState, timestamp: number): { state: SignalFieldState; replayEvents: ActivationEvent[] } {
  const recentActivity = state.recentActivations.filter(e => timestamp - e.timestamp < REPLAY_WINDOW)
  if (recentActivity.length === 0) return { state, replayEvents: [] }

  const candidateIds = [...new Set(recentActivity.map(e => e.particleId))]
  const replayEvents: ActivationEvent[] = []
  const particles = state.particles.map(p => {
    if (!candidateIds.includes(p.id)) return p
    const replayed = p.activation + REPLAY_STRENGTH * 0.3
    replayEvents.push({ particleId: p.id, strength: replayed, source: 'replay', timestamp })
    return { ...p, activation: Math.min(1, replayed) }
  })

  // Update recurrenceCount on matching assemblies
  const assemblies = state.assemblies.map(assembly => {
    const overlap = assembly.particleIds.filter(id => candidateIds.includes(id)).length
    const ratio = overlap / assembly.particleIds.length
    if (ratio > 0.5) {
      return { ...assembly, recurrenceCount: assembly.recurrenceCount + 1, lastActivatedAt: timestamp }
    }
    return assembly
  })

  return {
    state: {
      ...state,
      particles,
      assemblies,
      recentActivations: [...state.recentActivations, ...replayEvents].slice(-500),
    },
    replayEvents,
  }
}
