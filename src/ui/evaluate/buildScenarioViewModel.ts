import type { SignalScenario, SignalScenarioResult, SignalScenarioStepResult } from '../../signalScenario/signalScenarioTypes'

export type ScenarioStepViewModel = {
  stepId: string
  stepName: string
  inputType: string
  activeAssemblyCount: number
  bridgeCount: number
  recallSuccessCount: number
  teacherDependencyAverage: number
  notes: string[]
}

export type ScenarioMetricViewModel = {
  label: string
  value: number
  formatted: string
  goodDirection: 'up' | 'down'
}

export type ScenarioSummaryViewModel = {
  scenarioName: string
  scenarioDescription: string
  startedAt: number
  endedAt: number
  durationMs: number
  assemblyGrowth: number
  bridgeGrowth: number
  teacherDependencyDelta: number
  recallSuccessDelta: number
  overbindingRiskDelta: number
  promotionReadinessDelta: number
  notes: string[]
  metrics: ScenarioMetricViewModel[]
  steps: ScenarioStepViewModel[]
}

export type ScenarioRunnerViewModel = {
  scenarioId: string
  scenarioName: string
  scenarioDescription: string
  stepCount: number
  lastRunAt: number | null
}

const buildMetrics = (result: SignalScenarioResult): ScenarioMetricViewModel[] => [
  {
    label: 'Assembly Growth',
    value: result.metrics.assemblyGrowth,
    formatted: result.metrics.assemblyGrowth > 0 ? `+${result.metrics.assemblyGrowth}` : `${result.metrics.assemblyGrowth}`,
    goodDirection: 'up',
  },
  {
    label: 'Bridge Growth',
    value: result.metrics.bridgeGrowth,
    formatted: result.metrics.bridgeGrowth > 0 ? `+${result.metrics.bridgeGrowth}` : `${result.metrics.bridgeGrowth}`,
    goodDirection: 'up',
  },
  {
    label: 'Teacher Dependency Delta',
    value: result.metrics.teacherDependencyDelta,
    formatted: result.metrics.teacherDependencyDelta.toFixed(2),
    goodDirection: 'down',
  },
  {
    label: 'Recall Success Delta',
    value: result.metrics.recallSuccessDelta,
    formatted: result.metrics.recallSuccessDelta > 0 ? `+${result.metrics.recallSuccessDelta.toFixed(2)}` : result.metrics.recallSuccessDelta.toFixed(2),
    goodDirection: 'up',
  },
  {
    label: 'Overbinding Risk Delta',
    value: result.metrics.overbindingRiskDelta,
    formatted: result.metrics.overbindingRiskDelta.toFixed(2),
    goodDirection: 'down',
  },
  {
    label: 'Promotion Readiness Delta',
    value: result.metrics.promotionReadinessDelta,
    formatted: result.metrics.promotionReadinessDelta > 0 ? `+${result.metrics.promotionReadinessDelta.toFixed(2)}` : result.metrics.promotionReadinessDelta.toFixed(2),
    goodDirection: 'up',
  },
]

const buildStepViewModel = (
  step: SignalScenarioStepResult,
  scenario: SignalScenario,
): ScenarioStepViewModel => {
  const scenarioStep = scenario.steps.find((s) => s.id === step.stepId)
  return {
    stepId: step.stepId,
    stepName: scenarioStep?.expectedEffect ?? step.stepId,
    inputType: scenarioStep?.inputType ?? 'unknown',
    activeAssemblyCount: step.activeAssemblyCount,
    bridgeCount: step.bridgeCount,
    recallSuccessCount: step.recallSuccessCount,
    teacherDependencyAverage: step.teacherDependencyAverage,
    notes: step.notes,
  }
}

export const buildScenarioViewModel = (
  scenario: SignalScenario,
  result: SignalScenarioResult,
): ScenarioSummaryViewModel => ({
  scenarioName: scenario.name,
  scenarioDescription: scenario.description,
  startedAt: result.startedAt,
  endedAt: result.endedAt,
  durationMs: result.endedAt - result.startedAt,
  assemblyGrowth: result.metrics.assemblyGrowth,
  bridgeGrowth: result.metrics.bridgeGrowth,
  teacherDependencyDelta: result.metrics.teacherDependencyDelta,
  recallSuccessDelta: result.metrics.recallSuccessDelta,
  overbindingRiskDelta: result.metrics.overbindingRiskDelta,
  promotionReadinessDelta: result.metrics.promotionReadinessDelta,
  notes: result.notes,
  metrics: buildMetrics(result),
  steps: result.stepResults.map((step) => buildStepViewModel(step, scenario)),
})

export const buildScenarioRunnerViewModel = (
  scenario: SignalScenario,
  lastRunAt: number | null = null,
): ScenarioRunnerViewModel => ({
  scenarioId: scenario.id,
  scenarioName: scenario.name,
  scenarioDescription: scenario.description,
  stepCount: scenario.steps.length,
  lastRunAt,
})
