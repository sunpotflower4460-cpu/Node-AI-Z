import type { PromotionCandidate, SharedTrunkState } from '../coreTypes'
import type { TrunkApplyRecord, TrunkRevertRecord, TrunkUndoResult } from './trunkSafetyTypes'

const removeByKey = <T extends { key: string }>(items: T[], key: string): T[] =>
  items.filter((item) => item.key !== key)

export const trunkRevert = ({
  currentTrunk,
  targetApplyRecord,
  candidate,
  reason,
  safetySnapshotId,
  revertedBy = 'human_reviewer',
}: {
  currentTrunk: SharedTrunkState
  targetApplyRecord: TrunkApplyRecord
  candidate?: PromotionCandidate
  reason: string
  safetySnapshotId?: string
  revertedBy?: TrunkRevertRecord['revertedBy']
}): { undoResult: TrunkUndoResult; revertRecord: TrunkRevertRecord } => {
  const rollbackMetadata = targetApplyRecord.rollbackMetadata
  const notes: string[] = []
  const nextTrunk: SharedTrunkState = {
    ...currentTrunk,
    schemaPatterns: [...currentTrunk.schemaPatterns],
    promotedMixedNodes: [...currentTrunk.promotedMixedNodes],
    conceptualBiases: { ...currentTrunk.conceptualBiases },
    protoMeaningBias: { ...currentTrunk.protoMeaningBias },
    optionDetectionBias: { ...currentTrunk.optionDetectionBias },
    notes: [...currentTrunk.notes],
    version: currentTrunk.version + 1,
    lastUpdatedAt: Date.now(),
  }

  if (rollbackMetadata?.schemaPatterns?.length) {
    for (const change of rollbackMetadata.schemaPatterns) {
      nextTrunk.schemaPatterns =
        change.action === 'added'
          ? removeByKey(nextTrunk.schemaPatterns, change.key)
          : nextTrunk.schemaPatterns.map((pattern) =>
              pattern.key === change.key && change.previousPattern ? change.previousPattern : pattern
            )
      notes.push(`schema revert ${change.key} (${change.action})`)
    }
  }

  if (rollbackMetadata?.mixedNodes?.length) {
    for (const change of rollbackMetadata.mixedNodes) {
      nextTrunk.promotedMixedNodes =
        change.action === 'added'
          ? removeByKey(nextTrunk.promotedMixedNodes, change.key)
          : nextTrunk.promotedMixedNodes.map((node) =>
              node.key === change.key && change.previousNode ? change.previousNode : node
            )
      notes.push(`mixed node revert ${change.key} (${change.action})`)
    }
  }

  for (const change of rollbackMetadata?.conceptualBiases ?? []) {
    if (change.previousValue === undefined) {
      delete nextTrunk.conceptualBiases[change.key]
    } else {
      nextTrunk.conceptualBiases[change.key] = change.previousValue
    }
    notes.push(`conceptual bias revert ${change.key}`)
  }

  for (const change of rollbackMetadata?.protoMeaningBiases ?? []) {
    if (change.previousValue === undefined) {
      delete nextTrunk.protoMeaningBias[change.key]
    } else {
      nextTrunk.protoMeaningBias[change.key] = change.previousValue
    }
    notes.push(`protoMeaning bias revert ${change.key}`)
  }

  for (const change of rollbackMetadata?.optionDetectionBiases ?? []) {
    if (change.previousValue === undefined) {
      delete nextTrunk.optionDetectionBias[change.key]
    } else {
      nextTrunk.optionDetectionBias[change.key] = change.previousValue
    }
    notes.push(`optionDetection bias revert ${change.key}`)
  }

  if (notes.length === 0) {
    notes.push(
      `No rollback metadata was stored for ${targetApplyRecord.candidateId}${candidate ? ` (${candidate.type})` : ''}`
    )
  }

  nextTrunk.notes.push(`Reverted trunk apply ${targetApplyRecord.id}: ${reason}`)

  const revertRecord: TrunkRevertRecord = {
    id: `trunk-revert-${targetApplyRecord.id}-${Date.now()}`,
    targetApplyRecordId: targetApplyRecord.id,
    revertedAt: Date.now(),
    reason,
    safetySnapshotId,
    trunkDiffSummary: notes,
    revertedBy,
  }

  return {
    undoResult: {
      success: notes.length > 0,
      revertedApplyRecordId: targetApplyRecord.id,
      safetySnapshotId,
      notes,
      nextTrunk,
    },
    revertRecord,
  }
}
