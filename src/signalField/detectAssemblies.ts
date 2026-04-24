import type { SignalFieldState, Assembly, ActivationEvent } from './signalFieldTypes'

const CO_ACTIVATION_WINDOW = 200
const MIN_ASSEMBLY_SIZE = 3
const MIN_RECURRENCE = 2

export function detectAssemblies(state: SignalFieldState, allEvents: ActivationEvent[]): SignalFieldState {
  const now = allEvents.at(-1)?.timestamp ?? 0
  const windowEvents = allEvents.filter(e => now - e.timestamp < CO_ACTIVATION_WINDOW)
  const activeIds = [...new Set(windowEvents.map(e => e.particleId))]

  if (activeIds.length < MIN_ASSEMBLY_SIZE) return state

  // Check if this group overlaps with existing assemblies
  const updatedAssemblies: Assembly[] = state.assemblies.map(assembly => {
    const overlap = assembly.particleIds.filter(id => activeIds.includes(id)).length
    const ratio = overlap / assembly.particleIds.length
    if (ratio > 0.6) {
      return {
        ...assembly,
        recurrenceCount: assembly.recurrenceCount + 1,
        lastActivatedAt: now,
        averageCoactivation: (assembly.averageCoactivation + ratio) / 2,
      }
    }
    return assembly
  })

  // Try to form a new assembly if no good match
  const bestOverlap = state.assemblies.reduce((best, a) => {
    const overlap = a.particleIds.filter(id => activeIds.includes(id)).length / a.particleIds.length
    return overlap > best ? overlap : best
  }, 0)

  let finalAssemblies = updatedAssemblies
  if (bestOverlap < 0.6 && activeIds.length >= MIN_ASSEMBLY_SIZE) {
    const newAssembly: Assembly = {
      id: `assembly_${now}_${activeIds.length}`,
      particleIds: activeIds.slice(0, 50),
      recurrenceCount: 1,
      averageCoactivation: 1.0,
      lastActivatedAt: now,
    }
    finalAssemblies = [...updatedAssemblies, newAssembly]
  }

  // Remove stale assemblies that never grew
  const pruned = finalAssemblies.filter(a => a.recurrenceCount >= MIN_RECURRENCE || now - a.lastActivatedAt < 1000)

  return { ...state, assemblies: pruned }
}
