import { determineSignalDevelopmentStage } from '../signalDevelopment/determineSignalDevelopmentStage'
import { buildDevelopmentSummary } from '../signalDevelopment/buildDevelopmentSummary'
import type { SignalPersonalBranch } from './signalBranchTypes'
import { updateBridgeMaturity } from './updateBridgeMaturity'

export function updateSignalPersonalBranch(
  branch: SignalPersonalBranch,
): SignalPersonalBranch {
  const now = Date.now()
  const updatedBridges = branch.bridgeRecords.map(record => updateBridgeMaturity(record))

  const teacherFreeBridgeCount = updatedBridges.filter(
    b => b.stage === 'teacher_free' || b.stage === 'promoted',
  ).length

  const avgTeacherDependency =
    updatedBridges.length > 0
      ? updatedBridges.reduce((sum, b) => sum + b.teacherDependencyScore, 0) /
        updatedBridges.length
      : 0

  const avgRecallSuccess =
    updatedBridges.length > 0
      ? updatedBridges.reduce((sum, b) => sum + b.recallSuccessScore, 0) / updatedBridges.length
      : 0

  const stagedBranch: SignalPersonalBranch = {
    ...branch,
    bridgeRecords: updatedBridges,
    updatedAt: now,
    summary: {
      assemblyCount: branch.assemblyRecords.length,
      bridgeCount: updatedBridges.length,
      protoSeedCount: branch.protoSeedRecords.length,
      teacherFreeBridgeCount,
      averageTeacherDependency: avgTeacherDependency,
      averageRecallSuccess: avgRecallSuccess,
    },
  }

  return {
    ...stagedBranch,
    developmentState: buildDevelopmentSummary(determineSignalDevelopmentStage(stagedBranch)),
  }
}
