import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalDevelopmentStage } from './signalDevelopmentTypes'

export function determineSignalDevelopmentStage(
  branch: SignalPersonalBranch,
): SignalDevelopmentStage {
  let stage: SignalDevelopmentStage = 1

  if (branch.assemblyRecords.length > 0) {
    stage = 2
  }
  if (branch.bridgeRecords.some(record => record.teacherConfirmCount > 0)) {
    stage = 3
  }
  if (branch.bridgeRecords.some(record => record.selfRecallSuccessCount > 0)) {
    stage = 4
  }
  if (branch.contrastRecords.length > 0) {
    stage = 5
  }
  if (branch.sequenceRecords.length > 0) {
    stage = 6
  }
  if (
    branch.sequenceRecords.length > 0 &&
    (branch.bridgeRecords.length > 0 || branch.contrastRecords.length > 0)
  ) {
    stage = 7
  }
  if (
    branch.summary.teacherFreeBridgeCount > 0 &&
    branch.summary.averageRecallSuccess >= 0.45 &&
    branch.sequenceRecords.length > 0
  ) {
    stage = 8
  }

  return stage
}
