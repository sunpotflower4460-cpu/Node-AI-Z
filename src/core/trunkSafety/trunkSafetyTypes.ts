import type { PromotionCandidate, SharedTrunkState } from '../coreTypes'
import type { SchemaPattern } from '../../memory/types'
import type { MixedLatentNode } from '../../node/mixedNodeTypes'

export type TrunkSchemaRollbackChange = {
  key: string
  action: 'added' | 'updated'
  previousPattern?: SchemaPattern
  nextPattern?: SchemaPattern
}

export type TrunkMixedNodeRollbackChange = {
  key: string
  action: 'added' | 'updated'
  previousNode?: MixedLatentNode
  nextNode?: MixedLatentNode
}

export type TrunkBiasRollbackChange = {
  key: string
  previousValue?: number
  nextValue?: number
}

export type TrunkApplyRollbackMetadata = {
  schemaPatterns?: TrunkSchemaRollbackChange[]
  mixedNodes?: TrunkMixedNodeRollbackChange[]
  conceptualBiases?: TrunkBiasRollbackChange[]
  protoMeaningBiases?: TrunkBiasRollbackChange[]
  optionDetectionBiases?: TrunkBiasRollbackChange[]
}

export type TrunkApplyRecord = {
  id: string
  candidateId: string
  promotionKind: string
  appliedAt: number
  trunkBeforeSnapshotId?: string
  trunkAfterSnapshotId?: string
  trunkDiffSummary: string[]
  appliedBy: 'system' | 'ai_sensei' | 'human_reviewer'
  rollbackMetadata?: TrunkApplyRollbackMetadata
}

export type TrunkRevertRecord = {
  id: string
  targetApplyRecordId: string
  revertedAt: number
  reason: string
  safetySnapshotId?: string
  trunkDiffSummary: string[]
  revertedBy: 'system' | 'human_reviewer'
}

export type TrunkConsistencyResult = {
  ok: boolean
  notes: string[]
  warningKeys: string[]
}

export type TrunkUndoResult = {
  success: boolean
  revertedApplyRecordId: string
  safetySnapshotId?: string
  notes: string[]
  nextTrunk: SharedTrunkState
}

export type TrunkSnapshotRecord = {
  id: string
  createdAt: number
  kind: 'before_apply' | 'after_apply' | 'revert_safety' | 'after_revert'
  trunkVersion: number
  candidateId?: string
  applyRecordId?: string
  label?: string
}

export type TrunkSafetyState = {
  applyRecords: TrunkApplyRecord[]
  revertRecords: TrunkRevertRecord[]
  snapshotRecords: TrunkSnapshotRecord[]
  currentRevertSafetySnapshotId?: string
  lastTrunkConsistencyCheck?: TrunkConsistencyResult
  safeUndoNotes: string[]
}

export type BuildTrunkDiffSummaryInput = {
  before: SharedTrunkState
  after: SharedTrunkState
  candidate?: PromotionCandidate
}
