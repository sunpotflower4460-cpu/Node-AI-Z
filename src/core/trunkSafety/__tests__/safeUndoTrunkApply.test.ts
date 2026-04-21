import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import {
  appendTrunkApplyRecord,
  clearTrunkSafetyState,
  findRevertRecordByApplyRecordId,
  getCurrentRevertSafetySnapshotId,
  getLastTrunkConsistencyCheck,
} from '../index'
import { safeUndoTrunkApply } from '../safeUndoTrunkApply'

describe('safeUndoTrunkApply', () => {
  beforeEach(() => {
    clearTrunkSafetyState()
  })

  it('creates a safety snapshot, reverts the apply, and records consistency', () => {
    const trunk = createEmptySharedTrunk()
    trunk.schemaPatterns.push({
      id: 'schema-1',
      key: 'calm-bridge',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['calm'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['steady'],
      recurrenceCount: 3,
      strength: 0.6,
      confidence: 0.7,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 2,
    })

    appendTrunkApplyRecord({
      id: 'apply-1',
      candidateId: 'candidate-1',
      promotionKind: 'schema',
      appliedAt: 10,
      trunkDiffSummary: ['schemaPatterns +1: calm-bridge'],
      appliedBy: 'system',
      rollbackMetadata: {
        schemaPatterns: [{ key: 'calm-bridge', action: 'added' }],
      },
    })

    const result = safeUndoTrunkApply({
      currentTrunk: trunk,
      applyRecordId: 'apply-1',
      reason: 'human undo',
    })

    expect(result.safetySnapshotId).toBeDefined()
    expect(getCurrentRevertSafetySnapshotId()).toBe(result.safetySnapshotId)
    expect(findRevertRecordByApplyRecordId('apply-1')).toBeDefined()
    expect(getLastTrunkConsistencyCheck()).toBeDefined()
    expect(result.nextTrunk.schemaPatterns).toHaveLength(0)
  })
})
