import type { SignalModeRuntimeResult } from '../runtime/runSignalModeRuntime'
import type { SignalModeObserveSummary } from './buildSignalModeObserveSummary'
import type { SignalRiskReport } from '../signalRisk/signalRiskTypes'
import type { SignalDevelopmentDashboard } from '../signalDevelopmentDashboard/developmentDashboardTypes'
import type { SignalDevelopmentState } from '../signalDevelopment/signalDevelopmentTypes'
import type { SignalModeSnapshot } from '../signalPersistence/signalPersistenceTypes'
import { buildSignalModeObserveSummary } from './buildSignalModeObserveSummary'
import { buildSignalRiskSummary } from '../signalRisk/buildSignalRiskSummary'
import { buildDevelopmentDashboard } from '../signalDevelopmentDashboard/buildDevelopmentDashboard'
import { determineSignalDevelopmentStage } from '../signalDevelopment/determineSignalDevelopmentStage'
import { buildDevelopmentSummary } from '../signalDevelopment/buildDevelopmentSummary'

export type SignalOverviewSource = {
  observeSummary: SignalModeObserveSummary
  riskReport: SignalRiskReport
  developmentDashboard: SignalDevelopmentDashboard
  developmentStage: SignalDevelopmentState
  snapshot?: SignalModeSnapshot
}

export const buildSignalOverviewSource = (
  result: SignalModeRuntimeResult,
): SignalOverviewSource => {
  const observeSummary = buildSignalModeObserveSummary(result)
  const riskReport = buildSignalRiskSummary(result.personalBranch, result.fieldState)
  const developmentDashboard = buildDevelopmentDashboard(result.personalBranch, riskReport)
  const developmentStage = buildDevelopmentSummary(determineSignalDevelopmentStage(result.personalBranch))

  return {
    observeSummary,
    riskReport,
    developmentDashboard,
    developmentStage,
    snapshot: result.snapshot,
  }
}
