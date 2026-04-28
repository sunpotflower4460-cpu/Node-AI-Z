import type { SignalScenarioResult } from './signalScenarioTypes'

export type ScenarioEvaluation = {
  scenarioId: string
  teacherDependencyDecreased: boolean
  recallSuccessIncreased: boolean
  bridgeGrowthAcceptable: boolean
  promotionReadinessIncreased: boolean
  overbindingRiskAcceptable: boolean
  overallHealthy: boolean
  notes: string[]
}

export function evaluateScenarioResult(result: SignalScenarioResult): ScenarioEvaluation {
  const notes: string[] = []

  const teacherDependencyDecreased = result.metrics.teacherDependencyDelta <= 0
  if (!teacherDependencyDecreased) {
    notes.push(`teacher dependency increased by ${result.metrics.teacherDependencyDelta.toFixed(3)}`)
  }

  const recallSuccessIncreased = result.metrics.recallSuccessDelta >= 0
  if (!recallSuccessIncreased) {
    notes.push(`recall success decreased by ${Math.abs(result.metrics.recallSuccessDelta)}`)
  }

  const stepCount = result.stepResults.length
  const bridgesPerStep = stepCount > 0 ? result.metrics.bridgeGrowth / stepCount : 0
  const bridgeGrowthAcceptable = bridgesPerStep <= 20
  if (!bridgeGrowthAcceptable) {
    notes.push(`bridge growth too high: ${bridgesPerStep.toFixed(1)} bridges/step`)
  }

  const promotionReadinessIncreased = result.metrics.promotionReadinessDelta >= 0
  const overbindingRiskAcceptable = result.metrics.overbindingRiskDelta < 0.5

  const overallHealthy =
    bridgeGrowthAcceptable && overbindingRiskAcceptable && recallSuccessIncreased

  return {
    scenarioId: result.scenarioId,
    teacherDependencyDecreased,
    recallSuccessIncreased,
    bridgeGrowthAcceptable,
    promotionReadinessIncreased,
    overbindingRiskAcceptable,
    overallHealthy,
    notes,
  }
}
