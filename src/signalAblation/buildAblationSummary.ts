import type { SignalAblationComparison } from './signalAblationTypes'

export type AblationSummary = {
  disabledFeatures: string[]
  assemblyGrowthDiff: number
  bridgeGrowthDiff: number
  recallSuccessDiff: number
  teacherDependencyDiff: number
  notes: string[]
}

export function buildAblationSummary(comparison: SignalAblationComparison): AblationSummary {
  return {
    disabledFeatures: comparison.disabledFeatures,
    assemblyGrowthDiff: comparison.metricDiff.assemblyGrowthDiff,
    bridgeGrowthDiff: comparison.metricDiff.bridgeGrowthDiff,
    recallSuccessDiff: comparison.metricDiff.recallSuccessDiff,
    teacherDependencyDiff: comparison.metricDiff.teacherDependencyDiff,
    notes: comparison.notes,
  }
}
