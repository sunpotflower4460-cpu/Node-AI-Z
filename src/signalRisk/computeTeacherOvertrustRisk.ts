import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

export function computeTeacherOvertrustRisk(branch: SignalPersonalBranch): number {
  if (branch.bridgeRecords.length === 0) return 0

  const teacherDependentBridges = branch.bridgeRecords.filter(
    r => r.teacherConfirmCount > 2 && r.selfRecallSuccessCount < 1,
  ).length
  const dependencyRatio = teacherDependentBridges / branch.bridgeRecords.length

  const nearPromotedTeacherDependent = branch.bridgeRecords.filter(
    r =>
      r.teacherDependencyScore > 0.7 &&
      (r.stage === 'reinforced' || r.stage === 'teacher_light'),
  ).length
  const nearPromotedRatio = nearPromotedTeacherDependent / branch.bridgeRecords.length

  const avgTeacherDep = branch.summary.averageTeacherDependency

  return Math.min(1, dependencyRatio * 0.4 + nearPromotedRatio * 0.3 + avgTeacherDep * 0.3)
}
