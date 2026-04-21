import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import {
  appendTrunkApplyRecord,
  clearTrunkSafetyState,
  findTrunkApplyRecord,
  listApplyRecordsByCandidateId,
  listTrunkApplyRecords,
  loadTrunkSnapshot,
  saveTrunkSnapshot,
} from '../index'

describe('trunkApplyLedger', () => {
  beforeEach(() => {
    clearTrunkSafetyState()
  })

  it('stores and looks up trunk apply records', () => {
    appendTrunkApplyRecord({
      id: 'apply-1',
      candidateId: 'candidate-1',
      promotionKind: 'schema',
      appliedAt: 10,
      trunkDiffSummary: ['schemaPatterns +1: calm-bridge'],
      appliedBy: 'system',
      supportCount: 2,
      comparedBranchCount: 3,
      consistencyScore: 0.7,
    })

    expect(listTrunkApplyRecords()).toHaveLength(1)
    expect(findTrunkApplyRecord('apply-1')?.candidateId).toBe('candidate-1')
    expect(findTrunkApplyRecord('apply-1')?.supportCount).toBe(2)
    expect(listApplyRecordsByCandidateId('candidate-1')).toHaveLength(1)
  })

  it('stores trunk snapshots for later restore', () => {
    const trunk = createEmptySharedTrunk()
    trunk.notes.push('snapshot source')

    const snapshot = saveTrunkSnapshot(trunk, {
      kind: 'before_apply',
      candidateId: 'candidate-1',
      label: 'before apply',
    })

    expect(loadTrunkSnapshot(snapshot.id)?.notes).toContain('snapshot source')
  })
})
