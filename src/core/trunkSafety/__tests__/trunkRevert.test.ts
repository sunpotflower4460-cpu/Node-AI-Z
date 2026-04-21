import { describe, expect, it } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { trunkRevert } from '../trunkRevert'

describe('trunkRevert', () => {
  it('reverts a schema add using rollback metadata', () => {
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

    const result = trunkRevert({
      currentTrunk: trunk,
      targetApplyRecord: {
        id: 'apply-1',
        candidateId: 'candidate-1',
        promotionKind: 'schema',
        appliedAt: 1,
        trunkDiffSummary: ['schemaPatterns +1: calm-bridge'],
        appliedBy: 'system',
        rollbackMetadata: {
          schemaPatterns: [{ key: 'calm-bridge', action: 'added' }],
        },
      },
      reason: 'unsafe apply',
      safetySnapshotId: 'snapshot-1',
    })

    expect(result.undoResult.success).toBe(true)
    expect(result.undoResult.nextTrunk.schemaPatterns).toHaveLength(0)
    expect(result.revertRecord.safetySnapshotId).toBe('snapshot-1')
  })
})
