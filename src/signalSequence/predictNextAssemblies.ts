import type { SignalSequenceRecord, SequencePrediction } from './signalSequenceTypes'

function buildContextKey(contextAssemblyIds: string[]): string {
  return contextAssemblyIds.join('>')
}

export function predictNextAssemblies(
  records: SignalSequenceRecord[],
  currentAssemblyIds: string[],
  limit = 3,
): SequencePrediction[] {
  const uniqueCurrent = [...new Set(currentAssemblyIds)].slice(-3)
  const contextKey = buildContextKey(uniqueCurrent)
  const exactRecord = records.find(record => buildContextKey(record.assemblyIds) === contextKey)
  const partialRecord =
    exactRecord ??
    records.find(record =>
      record.assemblyIds.length > 0 &&
      uniqueCurrent.length > 0 &&
      record.assemblyIds.at(-1) === uniqueCurrent.at(-1),
    )

  if (!partialRecord) {
    return []
  }

  const totalWeight = Object.values(partialRecord.transitionWeights).reduce((sum, weight) => sum + weight, 0) || 1

  return Object.entries(partialRecord.transitionWeights)
    .sort(([, weightA], [, weightB]) => weightB - weightA)
    .slice(0, limit)
    .map(([predictedAssemblyId, weight]) => ({
      contextAssemblyIds: partialRecord.assemblyIds,
      predictedAssemblyId,
      confidence: weight / totalWeight,
    }))
}
