import type { SignalPersistenceSummary } from '../signalPersistence/signalPersistenceTypes'
import type { ScenarioSummary } from '../signalScenario/buildScenarioSummary'
import type { AblationSummary } from '../signalAblation/buildAblationSummary'
import type { SignalRiskReport } from '../signalRisk/signalRiskTypes'
import type { DevelopmentDashboardSummary } from '../signalDevelopmentDashboard/buildDevelopmentDashboardSummary'

export type SignalEvaluationObserveSummary = {
  persistence: SignalPersistenceSummary
  scenario?: ScenarioSummary
  ablation?: AblationSummary
  risk: SignalRiskReport
  development: DevelopmentDashboardSummary
}

export function buildSignalEvaluationObserveSummary(input: {
  persistence: SignalPersistenceSummary
  scenario?: ScenarioSummary
  ablation?: AblationSummary
  risk: SignalRiskReport
  development: DevelopmentDashboardSummary
}): SignalEvaluationObserveSummary {
  return {
    persistence: input.persistence,
    scenario: input.scenario,
    ablation: input.ablation,
    risk: input.risk,
    development: input.development,
  }
}
