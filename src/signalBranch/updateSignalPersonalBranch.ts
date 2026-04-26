import type { SignalPersonalBranch } from './signalBranchTypes'
import { updateBridgeMaturity } from './updateBridgeMaturity'

/**
 * Update all bridge maturity stages and recompute summary statistics.
 *
 * This should be called after:
 * - Recording new bridge experiences
 * - Recording recall successes/failures
 * - Periodically during runtime to refresh scores
 */
export function updateSignalPersonalBranch(
  branch: SignalPersonalBranch,
): SignalPersonalBranch {
  const now = Date.now()

  // Update all bridge maturity stages
  const updatedBridges = branch.bridgeRecords.map(record => updateBridgeMaturity(record))

  // Recompute summary statistics
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

  return {
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
}
