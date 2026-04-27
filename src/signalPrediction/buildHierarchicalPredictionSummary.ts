import type { HierarchicalPredictionMemory } from './hierarchicalPredictionTypes'

export type HierarchicalPredictionSummary = {
  totalPredictions: number
  confirmedCount: number
  failedCount: number
  averageSurprise: number
  topPredictions: Array<{
    targetType: 'assembly' | 'bridge' | 'proto_seed' | 'sequence'
    targetId: string
    confidence: number
  }>
  notes: string[]
}

export function buildHierarchicalPredictionSummary(
  memory: HierarchicalPredictionMemory,
): HierarchicalPredictionSummary {
  const confirmedCount = memory.recentComparisons.filter(comparison => comparison.confirmed).length
  const failedCount = memory.recentComparisons.length - confirmedCount
  const notes: string[] = []

  if (memory.averageSurprise >= 0.55) {
    notes.push('Prediction surprise is high; keep learning rate and attention exploratory')
  }

  return {
    totalPredictions: memory.recentPredictions.length,
    confirmedCount,
    failedCount,
    averageSurprise: memory.averageSurprise,
    topPredictions: [...memory.recentPredictions]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(prediction => ({
        targetType: prediction.targetType,
        targetId: prediction.targetId,
        confidence: prediction.confidence,
      })),
    notes,
  }
}
