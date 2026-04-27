import type { PlasticitySummary, SignalPlasticityRecord } from './signalPlasticityTypes'
import { computeEffectiveSignalWeight } from './computeEffectiveSignalWeight'

export function buildPlasticitySummary(records: SignalPlasticityRecord[]): PlasticitySummary {
  const effectiveWeights = records.map(record => ({
    record,
    effectiveWeight: computeEffectiveSignalWeight(record.weights),
  }))

  return {
    totalRecords: records.length,
    averageEffectiveWeight:
      effectiveWeights.length > 0
        ? effectiveWeights.reduce((sum, entry) => sum + entry.effectiveWeight, 0) / effectiveWeights.length
        : 0,
    topTargets: effectiveWeights
      .sort((a, b) => b.effectiveWeight - a.effectiveWeight)
      .slice(0, 5)
      .map(entry => ({
        targetType: entry.record.targetType,
        targetId: entry.record.targetId,
        effectiveWeight: entry.effectiveWeight,
      })),
    longTermDominantCount: records.filter(record => record.weights.longTerm >= record.weights.shortTerm).length,
  }
}
