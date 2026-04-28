import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

export function computeFalseBindingRisk(branch: SignalPersonalBranch): number {
  if (branch.bridgeRecords.length === 0) return 0

  const highFailureCount = branch.bridgeRecords.filter(r => r.failedRecallCount > 2).length
  const failureRatio = highFailureCount / branch.bridgeRecords.length

  const lowConfidenceReinforced = branch.bridgeRecords.filter(
    r => r.confidence < 0.4 && r.teacherConfirmCount > 1,
  ).length
  const lowConfidenceRatio = lowConfidenceReinforced / branch.bridgeRecords.length

  const mislabeledContrast = branch.contrastRecords.filter(
    r => r.relation === 'same_object' && r.confidence < 0.5,
  ).length
  const mislabelRatio =
    branch.contrastRecords.length > 0 ? mislabeledContrast / branch.contrastRecords.length : 0

  return Math.min(1, failureRatio * 0.4 + lowConfidenceRatio * 0.3 + mislabelRatio * 0.3)
}
