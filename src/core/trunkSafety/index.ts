export type {
  TrunkApplyRecord,
  TrunkRevertRecord,
  TrunkConsistencyResult,
  TrunkUndoResult,
  TrunkSnapshotRecord,
  TrunkApplyRollbackMetadata,
} from './trunkSafetyTypes'

export {
  appendTrunkApplyRecord,
  listTrunkApplyRecords,
  findTrunkApplyRecord,
  listApplyRecordsByCandidateId,
  appendTrunkRevertRecord,
  listTrunkRevertRecords,
  findTrunkRevertRecord,
  findRevertRecordByApplyRecordId,
  saveTrunkSnapshot,
  loadTrunkSnapshot,
  listTrunkSnapshotRecords,
  findTrunkSnapshotRecord,
  setCurrentRevertSafetySnapshotId,
  getCurrentRevertSafetySnapshotId,
  setLastTrunkConsistencyCheck,
  getLastTrunkConsistencyCheck,
  setSafeUndoNotes,
  getSafeUndoNotes,
  getTrunkSafetyState,
  restoreTrunkSafetyState,
  attachTrunkSafetyState,
  clearTrunkSafetyState,
} from './trunkApplyLedger'

export { buildTrunkDiffSummary } from './buildTrunkDiffSummary'
export { runTrunkConsistencyCheck } from './runTrunkConsistencyCheck'
export { trunkRevert } from './trunkRevert'
export { safeUndoTrunkApply } from './safeUndoTrunkApply'
