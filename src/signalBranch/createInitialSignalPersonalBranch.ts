import type { SignalPersonalBranch } from './signalBranchTypes'

/**
 * Create an empty Signal Mode personal branch.
 *
 * IMPORTANT: Does NOT inject meaning nodes or word dictionaries.
 * Signal Mode starts with an empty branch and builds experience through:
 * - Stable particles
 * - Ignition
 * - Propagation
 * - Hebbian learning
 * - Decay
 * - Replay
 * - Assembly detection
 * - Proto seed formation
 * - Bridge formation
 * - Personal branch accumulation
 */
export function createInitialSignalPersonalBranch(): SignalPersonalBranch {
  const now = Date.now()

  return {
    id: `signal_branch_${now}`,
    mode: 'signal_mode',
    createdAt: now,
    updatedAt: now,
    assemblyRecords: [],
    bridgeRecords: [],
    protoSeedRecords: [],
    recentRecallEvents: [],
    summary: {
      assemblyCount: 0,
      bridgeCount: 0,
      protoSeedCount: 0,
      teacherFreeBridgeCount: 0,
      averageTeacherDependency: 0,
      averageRecallSuccess: 0,
    },
  }
}
