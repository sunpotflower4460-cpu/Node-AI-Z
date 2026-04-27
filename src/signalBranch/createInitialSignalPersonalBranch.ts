import { createInitialModulatorState } from '../signalModulator/createInitialModulatorState'
import { buildDevelopmentSummary } from '../signalDevelopment/buildDevelopmentSummary'
import type { SignalPersonalBranch } from './signalBranchTypes'

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
    contrastRecords: [],
    sequenceRecords: [],
    plasticityRecords: [],
    recentRecallEvents: [],
    actionHistory: [],
    actionResults: [],
    outcomeMemory: {
      records: [],
      averageReward: 0,
      recentErrorRate: 0,
      successfulActionTypes: {},
    },
    modulatorState: createInitialModulatorState(),
    predictionMemory: {
      recentPredictions: [],
      recentComparisons: [],
      averageSurprise: 0,
      lastUpdatedAt: now,
    },
    reconsolidationState: {
      openMemories: [],
      recentlyRevisedTargetIds: [],
      recentlyRestabilizedTargetIds: [],
      lastUpdatedAt: now,
      notes: [],
    },
    developmentState: buildDevelopmentSummary(1),
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
