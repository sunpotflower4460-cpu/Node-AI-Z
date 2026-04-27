export type HierarchicalPrediction = {
  id: string
  targetType: 'assembly' | 'bridge' | 'proto_seed' | 'sequence'
  targetId: string
  contextId: string
  confidence: number
  reason: string
  createdAt: number
}

export type HierarchicalPredictionComparison = {
  predictionId: string
  targetType: HierarchicalPrediction['targetType']
  targetId: string
  confirmed: boolean
  surprise: number
  actualTargetIds: string[]
  notes: string[]
}

export type HierarchicalPredictionMemory = {
  recentPredictions: HierarchicalPrediction[]
  recentComparisons: HierarchicalPredictionComparison[]
  averageSurprise: number
  lastUpdatedAt: number
}
