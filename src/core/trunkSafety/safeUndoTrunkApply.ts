import { findPromotionQueueEntry } from '../promotion/promotionQueue'
import { saveSharedTrunkState } from '../sharedTrunk'
import { buildTrunkDiffSummary } from './buildTrunkDiffSummary'
import {
  appendTrunkRevertRecord,
  attachTrunkSafetyState,
  findRevertRecordByApplyRecordId,
  findTrunkApplyRecord,
  setCurrentRevertSafetySnapshotId,
  setLastTrunkConsistencyCheck,
  setSafeUndoNotes,
  saveTrunkSnapshot,
} from './trunkApplyLedger'
import { runTrunkConsistencyCheck } from './runTrunkConsistencyCheck'
import { trunkRevert } from './trunkRevert'
import type { SharedTrunkState } from '../coreTypes'
import type { TrunkUndoResult } from './trunkSafetyTypes'

export const safeUndoTrunkApply = ({
  currentTrunk,
  applyRecordId,
  reason,
  revertedBy = 'human_reviewer',
}: {
  currentTrunk: SharedTrunkState
  applyRecordId: string
  reason: string
  revertedBy?: 'system' | 'human_reviewer'
}): TrunkUndoResult => {
  const targetApplyRecord = findTrunkApplyRecord(applyRecordId)
  if (!targetApplyRecord) {
    return {
      success: false,
      revertedApplyRecordId: applyRecordId,
      notes: ['Target trunk apply record was not found'],
      nextTrunk: currentTrunk,
    }
  }

  if (findRevertRecordByApplyRecordId(applyRecordId)) {
    return {
      success: false,
      revertedApplyRecordId: applyRecordId,
      notes: ['This trunk apply has already been reverted'],
      nextTrunk: currentTrunk,
    }
  }

  const safetySnapshot = saveTrunkSnapshot(currentTrunk, {
    kind: 'revert_safety',
    applyRecordId,
    candidateId: targetApplyRecord.candidateId,
    label: `Safety snapshot before reverting ${applyRecordId}`,
  })
  setCurrentRevertSafetySnapshotId(safetySnapshot.id)

  const queueEntry = findPromotionQueueEntry(targetApplyRecord.candidateId)
  const { undoResult, revertRecord } = trunkRevert({
    currentTrunk,
    targetApplyRecord,
    candidate: queueEntry?.candidate,
    reason,
    safetySnapshotId: safetySnapshot.id,
    revertedBy,
  })

  saveTrunkSnapshot(undoResult.nextTrunk, {
    kind: 'after_revert',
    applyRecordId,
    candidateId: targetApplyRecord.candidateId,
    label: `Trunk after revert ${applyRecordId}`,
  })

  const trunkDiffSummary = buildTrunkDiffSummary({
    before: currentTrunk,
    after: undoResult.nextTrunk,
  })

  const consistencyResult = runTrunkConsistencyCheck(undoResult.nextTrunk)
  setLastTrunkConsistencyCheck(consistencyResult)

  const notes = [
    `Safety snapshot created: ${safetySnapshot.id}`,
    ...undoResult.notes,
    ...trunkDiffSummary,
    ...consistencyResult.notes,
  ]

  const recordedRevert = appendTrunkRevertRecord({
    ...revertRecord,
    safetySnapshotId: safetySnapshot.id,
    trunkDiffSummary,
  })

  setSafeUndoNotes(notes)

  const nextTrunk = attachTrunkSafetyState({
    ...undoResult.nextTrunk,
    currentRevertSafetySnapshotId: safetySnapshot.id,
    lastTrunkConsistencyCheck: consistencyResult,
    safeUndoNotes: notes,
  })

  saveSharedTrunkState(nextTrunk)

  return {
    success: undoResult.success && consistencyResult.ok,
    revertedApplyRecordId: recordedRevert.targetApplyRecordId,
    safetySnapshotId: safetySnapshot.id,
    notes,
    nextTrunk,
  }
}
