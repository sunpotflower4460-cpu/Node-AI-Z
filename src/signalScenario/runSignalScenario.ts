import type { SignalScenario, SignalScenarioResult, SignalScenarioStepResult } from './signalScenarioTypes'
import type { SignalAblationConfig } from '../signalAblation/signalAblationTypes'
import type { ScenarioStepState } from './runScenarioStep'
import { runScenarioStep } from './runScenarioStep'

export async function runSignalScenario(
  scenario: SignalScenario,
  initialState: ScenarioStepState = {
    fieldState: undefined,
    personalBranch: undefined,
    loopState: undefined,
    consolidationState: undefined,
    attentionBudget: undefined,
  },
  ablation?: SignalAblationConfig,
): Promise<SignalScenarioResult> {
  const startedAt = Date.now()
  const stepResults: SignalScenarioStepResult[] = []
  let state = initialState

  let stepTimestamp = startedAt
  for (const step of scenario.steps) {
    const repeat = step.repeat ?? 1
    for (let r = 0; r < repeat; r += 1) {
      stepTimestamp += 1000
      const { result, nextState } = await runScenarioStep(step, state, ablation, stepTimestamp)
      stepResults.push(result)
      state = nextState
    }
  }

  const endedAt = Date.now()
  const first = stepResults[0]
  const last = stepResults[stepResults.length - 1]

  const assemblyGrowth = last && first ? last.activeAssemblyCount - first.activeAssemblyCount : 0
  const bridgeGrowth = last && first ? last.bridgeCount - first.bridgeCount : 0
  const teacherDependencyDelta = last && first
    ? last.teacherDependencyAverage - first.teacherDependencyAverage
    : 0
  const recallSuccessDelta = last && first ? last.recallSuccessCount - first.recallSuccessCount : 0

  return {
    scenarioId: scenario.id,
    startedAt,
    endedAt,
    stepResults,
    metrics: {
      assemblyGrowth,
      bridgeGrowth,
      teacherDependencyDelta,
      recallSuccessDelta,
      overbindingRiskDelta: 0,
      promotionReadinessDelta: 0,
    },
    notes: [],
  }
}
