import type {
  HierarchicalPrediction,
  HierarchicalPredictionComparison,
  HierarchicalPredictionMemory,
} from './hierarchicalPredictionTypes'

export function updatePredictionMemory(input: {
  memory: HierarchicalPredictionMemory
  predictions: HierarchicalPrediction[]
  comparisons: HierarchicalPredictionComparison[]
  timestamp: number
}): HierarchicalPredictionMemory {
  const recentPredictions = [...input.memory.recentPredictions, ...input.predictions].slice(-30)
  const recentComparisons = [...input.memory.recentComparisons, ...input.comparisons].slice(-30)
  return {
    recentPredictions,
    recentComparisons,
    averageSurprise:
      recentComparisons.length > 0
        ? recentComparisons.reduce((sum, comparison) => sum + comparison.surprise, 0) /
          recentComparisons.length
        : 0,
    lastUpdatedAt: input.timestamp,
  }
}
