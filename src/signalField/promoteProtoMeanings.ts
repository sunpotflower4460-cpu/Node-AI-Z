import type { SignalFieldState, ProtoMeaning } from './signalFieldTypes'

const RECURRENCE_THRESHOLD = 3
const COACTIVATION_THRESHOLD = 0.5

export function promoteProtoMeanings(state: SignalFieldState, timestamp: number): SignalFieldState {
  const promotionCandidates = state.assemblies.filter(
    a => a.recurrenceCount >= RECURRENCE_THRESHOLD && a.averageCoactivation >= COACTIVATION_THRESHOLD,
  )

  const existingAssemblyIds = new Set(state.protoMeanings.flatMap(pm => pm.assemblyIds))
  const newProtoMeanings: ProtoMeaning[] = []

  for (const assembly of promotionCandidates) {
    if (existingAssemblyIds.has(assembly.id)) continue
    newProtoMeanings.push({
      id: `proto_${assembly.id}`,
      assemblyIds: [assembly.id],
      strength: assembly.averageCoactivation * assembly.recurrenceCount,
      promotedAt: timestamp,
    })
  }

  return {
    ...state,
    protoMeanings: [...state.protoMeanings, ...newProtoMeanings],
  }
}
