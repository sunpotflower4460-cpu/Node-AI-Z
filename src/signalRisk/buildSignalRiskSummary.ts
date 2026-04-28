import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalRiskReport } from './signalRiskTypes'
import { computeOverbindingRisk } from './computeOverbindingRisk'
import { computeFalseBindingRisk } from './computeFalseBindingRisk'
import { computeTeacherOvertrustRisk } from './computeTeacherOvertrustRisk'
import { computeDreamNoiseRisk } from './computeDreamNoiseRisk'

export function buildSignalRiskSummary(
  branch: SignalPersonalBranch,
  fieldState: SignalFieldState,
): SignalRiskReport {
  const overbindingRisk = computeOverbindingRisk(branch, fieldState)
  const falseBindingRisk = computeFalseBindingRisk(branch)
  const teacherOvertrustRisk = computeTeacherOvertrustRisk(branch)
  const dreamNoiseRisk = computeDreamNoiseRisk(branch, fieldState)

  const maxRisk = Math.max(overbindingRisk, falseBindingRisk, teacherOvertrustRisk, dreamNoiseRisk)
  const riskLevel: SignalRiskReport['riskLevel'] =
    maxRisk >= 0.7 ? 'high' : maxRisk >= 0.4 ? 'medium' : 'low'

  const warnings: string[] = []
  const recommendedActions: string[] = []

  if (overbindingRisk >= 0.4) {
    warnings.push(`High overbinding risk (${overbindingRisk.toFixed(2)})`)
    recommendedActions.push('Run similar-but-different scenario to reduce overbinding')
  }
  if (falseBindingRisk >= 0.4) {
    warnings.push(`High false binding risk (${falseBindingRisk.toFixed(2)})`)
    recommendedActions.push('Review bridges with high failed recall count')
  }
  if (teacherOvertrustRisk >= 0.4) {
    warnings.push(`High teacher overtrust risk (${teacherOvertrustRisk.toFixed(2)})`)
    recommendedActions.push('Run teacher-to-teacher-free scenario')
  }
  if (dreamNoiseRisk >= 0.4) {
    warnings.push(`High dream noise risk (${dreamNoiseRisk.toFixed(2)})`)
    recommendedActions.push('Reduce dream frequency or increase dream evaluation threshold')
  }

  return {
    overbindingRisk,
    falseBindingRisk,
    teacherOvertrustRisk,
    dreamNoiseRisk,
    riskLevel,
    warnings,
    recommendedActions,
  }
}
