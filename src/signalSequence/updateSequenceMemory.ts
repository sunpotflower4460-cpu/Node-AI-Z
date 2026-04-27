import type { SignalSequenceRecord, SequencePrediction } from './signalSequenceTypes'
import type { ActivationSequenceObservation } from './recordActivationSequence'

function buildContextKey(contextAssemblyIds: string[]): string {
  return contextAssemblyIds.join('>')
}

export function updateSequenceMemory(
  records: SignalSequenceRecord[],
  observation: ActivationSequenceObservation | null,
  previousPredictions: SequencePrediction[] = [],
): SignalSequenceRecord[] {
  if (!observation) {
    return records
  }

  const contextKey = buildContextKey(observation.contextAssemblyIds)
  const recordMap = new Map(records.map(record => [buildContextKey(record.assemblyIds), record]))
  const existing = recordMap.get(contextKey)
  const totalPredictionWeight = previousPredictions.reduce((sum, prediction) => sum + prediction.confidence, 0)
  const predictedIds = new Set(previousPredictions.map(prediction => prediction.predictedAssemblyId))
  const matchedPrediction = observation.nextAssemblyIds.some(id => predictedIds.has(id))
  const mismatchIncrement =
    previousPredictions.length > 0 && !matchedPrediction ? Math.max(1, Math.round(totalPredictionWeight * 3)) : 0

  const transitionWeights = { ...(existing?.transitionWeights ?? {}) }
  for (const assemblyId of observation.nextAssemblyIds) {
    transitionWeights[assemblyId] = (transitionWeights[assemblyId] ?? 0) + 1
  }

  const totalWeight = Object.values(transitionWeights).reduce((sum, weight) => sum + weight, 0)
  const predictionConfidence = totalWeight > 0 ? Math.max(...Object.values(transitionWeights)) / totalWeight : 0

  recordMap.set(contextKey, {
    id:
      existing?.id ??
      `sequence_${contextKey || 'root'}_${observation.nextAssemblyIds.join('-')}_${observation.observedAt}`,
    assemblyIds: observation.contextAssemblyIds,
    transitionWeights,
    recurrenceCount: (existing?.recurrenceCount ?? 0) + 1,
    lastObservedAt: observation.observedAt,
    predictionConfidence,
    mismatchCount: (existing?.mismatchCount ?? 0) + mismatchIncrement,
  })

  return Array.from(recordMap.values()).sort((a, b) => b.lastObservedAt - a.lastObservedAt)
}
