export type SignalAblationConfig = {
  teacherEnabled: boolean
  inhibitionEnabled: boolean
  dreamEnabled: boolean
  rewardEnabled: boolean
  modulatorEnabled: boolean
  sequenceMemoryEnabled: boolean
  contrastLearningEnabled: boolean
  consolidationEnabled: boolean
}

export type SignalAblationRunSummary = {
  runId: string
  ablationConfig: SignalAblationConfig
  disabledFeatures: string[]
  metrics: {
    assemblyGrowth: number
    bridgeGrowth: number
    recallSuccessDelta: number
    teacherDependencyDelta: number
    overbindingRiskDelta: number
    promotionReadinessDelta: number
  }
}

export type SignalAblationComparison = {
  baselineRunId: string
  ablatedRunId: string
  disabledFeatures: string[]
  metricDiff: {
    assemblyGrowthDiff: number
    bridgeGrowthDiff: number
    recallSuccessDiff: number
    teacherDependencyDiff: number
    overbindingRiskDiff: number
    promotionReadinessDiff: number
  }
  notes: string[]
}
