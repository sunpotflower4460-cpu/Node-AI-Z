import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalRiskReport } from '../signalRisk/signalRiskTypes'
import type { SignalDevelopmentDashboard } from './developmentDashboardTypes'
import { determineSignalDevelopmentStage } from '../signalDevelopment/determineSignalDevelopmentStage'
import { computeNextStageRequirements } from './computeNextStageRequirements'

const STAGE_LABELS: Record<number, string> = {
  1: 'Initialization',
  2: 'Assembly Detection',
  3: 'Teacher-Guided Binding',
  4: 'Self-Recall Emergence',
  5: 'Contrast Learning',
  6: 'Sequence Memory',
  7: 'Multi-Modal Integration',
  8: 'Teacher-Free Autonomous Learning',
}

export function buildDevelopmentDashboard(
  branch: SignalPersonalBranch,
  riskReport?: SignalRiskReport,
): SignalDevelopmentDashboard {
  const stage = determineSignalDevelopmentStage(branch)
  const requirements = computeNextStageRequirements(branch, stage)
  const nextStageNum = stage < 8 ? stage + 1 : undefined

  const strengths: string[] = []
  const bottlenecks: string[] = []
  const recommendedNextActions: string[] = []

  if (branch.assemblyRecords.length > 5) strengths.push('Strong assembly formation')
  if (branch.summary.teacherFreeBridgeCount > 0) strengths.push('Has teacher-free bridges')
  if (branch.summary.averageRecallSuccess > 0.5) strengths.push('Good recall success rate')
  if (branch.contrastRecords.length > 3) strengths.push('Active contrast learning')
  if (branch.sequenceRecords.length > 3) strengths.push('Active sequence learning')

  const unsatisfied = requirements.filter(r => !r.satisfied)
  for (const req of unsatisfied) {
    const formattedValue = Number.isInteger(req.currentValue) ? req.currentValue.toString() : req.currentValue.toFixed(2)
    bottlenecks.push(`${req.label} (${formattedValue}/${req.requiredValue})`)
    recommendedNextActions.push(`Improve: ${req.label}`)
  }

  if (riskReport) {
    if (riskReport.overbindingRisk > 0.4) {
      bottlenecks.push('High overbinding risk')
      recommendedNextActions.push('Run overbinding stress test and contrast learning')
    }
    if (riskReport.teacherOvertrustRisk > 0.4) {
      bottlenecks.push('Teacher overtrust detected')
      recommendedNextActions.push('Practice teacher-free recall')
    }
  }

  const stageProgress =
    requirements.length > 0
      ? requirements.filter(r => r.satisfied).length / requirements.length
      : 1

  return {
    currentStage: STAGE_LABELS[stage] ?? `Stage ${stage}`,
    stageProgress,
    nextStage: nextStageNum ? STAGE_LABELS[nextStageNum] : undefined,
    requirements,
    strengths,
    bottlenecks,
    recommendedNextActions,
  }
}
