import type { SignalSequenceRecord, SequencePrediction, SequenceSummary } from './signalSequenceTypes'

export function buildSequenceSummary(
  records: SignalSequenceRecord[],
  predictions: SequencePrediction[],
): SequenceSummary {
  return {
    totalRecords: records.length,
    predictedNext: predictions,
    topSequences: [...records]
      .sort((a, b) => b.predictionConfidence - a.predictionConfidence || b.recurrenceCount - a.recurrenceCount)
      .slice(0, 5)
      .map(record => ({
        contextAssemblyIds: record.assemblyIds,
        predictionConfidence: record.predictionConfidence,
        recurrenceCount: record.recurrenceCount,
      })),
    totalMismatchCount: records.reduce((sum, record) => sum + record.mismatchCount, 0),
    mismatchedContexts: [...records]
      .filter(record => record.mismatchCount > 0)
      .sort((a, b) => b.mismatchCount - a.mismatchCount)
      .slice(0, 5)
      .map(record => ({
        contextKey: record.assemblyIds.join('>') || 'root',
        predictedAssemblyIds: Object.keys(record.transitionWeights),
        actualAssemblyIds: [],
        mismatchScore: Math.min(1, record.mismatchCount / Math.max(record.recurrenceCount, 1)),
      })),
  }
}
