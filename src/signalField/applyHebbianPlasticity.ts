import type { SignalFieldState, ParticleLink, ActivationEvent } from './signalFieldTypes'

const MAX_LINKS = 10000
const HEBBIAN_STRENGTHEN = 0.05
const INITIAL_LINK_WEIGHT = 0.1
const TIME_WINDOW = 100

export function applyHebbianPlasticity(state: SignalFieldState, recentEvents: ActivationEvent[]): SignalFieldState {
  const now = recentEvents.at(-1)?.timestamp ?? 0
  const windowEvents = recentEvents.filter(e => now - e.timestamp < TIME_WINDOW)
  const activeIds = [...new Set(windowEvents.map(e => e.particleId))]
  if (activeIds.length < 2) return state

  const linkMap = new Map<string, ParticleLink>()
  for (const link of state.links) {
    linkMap.set(`${link.sourceId}:${link.targetId}`, link)
  }

  for (let i = 0; i < activeIds.length; i++) {
    for (let j = i + 1; j < activeIds.length; j++) {
      const key = `${activeIds[i]}:${activeIds[j]}`
      const existing = linkMap.get(key)
      if (existing) {
        linkMap.set(key, { ...existing, weight: Math.min(1, existing.weight + HEBBIAN_STRENGTHEN), age: existing.age + 1 })
      } else if (linkMap.size < MAX_LINKS) {
        linkMap.set(key, { sourceId: activeIds[i]!, targetId: activeIds[j]!, weight: INITIAL_LINK_WEIGHT, age: 1 })
      }
    }
  }

  return { ...state, links: Array.from(linkMap.values()) }
}
