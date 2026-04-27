import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { RestingReplayResult } from './signalConsolidationTypes'

/**
 * Apply resting replay results to the Signal Personal Branch.
 *
 * Updates assembly records and bridge records based on replay outcomes:
 * - Strengthened assemblies get increased stability and replay count
 * - Weakened assemblies get decreased stability
 * - Bridges connected to successful replays reduce teacher dependency
 */
export function consolidateSignalBranch(
  branch: SignalPersonalBranch,
  replayResult: RestingReplayResult,
): SignalPersonalBranch {
  const updatedAssemblyRecords = branch.assemblyRecords.map(record => {
    if (replayResult.strengthenedAssemblyIds.includes(record.assemblyId)) {
      return {
        ...record,
        replayCount: record.replayCount + 1,
        stabilityScore: Math.min(1.0, record.stabilityScore + 0.05),
        lastActivatedAt: Date.now(),
      }
    }

    if (replayResult.weakenedAssemblyIds.includes(record.assemblyId)) {
      return {
        ...record,
        stabilityScore: Math.max(0.0, record.stabilityScore - 0.1),
      }
    }

    return record
  })

  // Update bridges: reduce teacher dependency for bridges whose assemblies replayed successfully
  const updatedBridgeRecords = branch.bridgeRecords.map(bridge => {
    const sourceStrengthened = replayResult.strengthenedAssemblyIds.includes(
      bridge.sourceAssemblyId,
    )
    const targetStrengthened = replayResult.strengthenedAssemblyIds.includes(
      bridge.targetAssemblyId,
    )

    if (sourceStrengthened && targetStrengthened) {
      const newTeacherDependency = Math.max(
        0.0,
        bridge.teacherDependencyScore - 0.05,
      )
      return {
        ...bridge,
        teacherDependencyScore: newTeacherDependency,
        // Promote to teacher_free if dependency is low enough
        stage:
          newTeacherDependency < 0.3 && bridge.stage === 'teacher_light'
            ? ('teacher_free' as const)
            : bridge.stage,
      }
    }

    return bridge
  })

  return {
    ...branch,
    assemblyRecords: updatedAssemblyRecords,
    bridgeRecords: updatedBridgeRecords,
    updatedAt: Date.now(),
  }
}
