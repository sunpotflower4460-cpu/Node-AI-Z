import type { SignalScenarioResult } from './signalScenarioTypes'
import type { ScenarioEvaluation } from './evaluateScenarioResult'

export type ScenarioSummary = {
  scenarioId: string
  stepCount: number
  durationMs: number
  assemblyGrowth: number
  bridgeGrowth: number
  teacherDependencyDelta: number
  recallSuccessDelta: number
  overallHealthy: boolean
  notes: string[]
}

export function buildScenarioSummary(
  result: SignalScenarioResult,
  evaluation: ScenarioEvaluation,
): ScenarioSummary {
  return {
    scenarioId: result.scenarioId,
    stepCount: result.stepResults.length,
    durationMs: result.endedAt - result.startedAt,
    assemblyGrowth: result.metrics.assemblyGrowth,
    bridgeGrowth: result.metrics.bridgeGrowth,
    teacherDependencyDelta: result.metrics.teacherDependencyDelta,
    recallSuccessDelta: result.metrics.recallSuccessDelta,
    overallHealthy: evaluation.overallHealthy,
    notes: [...result.notes, ...evaluation.notes],
  }
}
