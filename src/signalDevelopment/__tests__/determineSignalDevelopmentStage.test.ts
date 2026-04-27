import { describe, expect, it } from 'vitest'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { determineSignalDevelopmentStage } from '../determineSignalDevelopmentStage'

describe('determineSignalDevelopmentStage', () => {
  it('advances to internal action selection when sequences and bridge/contrast memory exist', () => {
    const branch = createInitialSignalPersonalBranch()
    branch.assemblyRecords.push({
      id: 'a_record',
      assemblyId: 'a',
      particleIds: ['p1'],
      recurrenceCount: 3,
      replayCount: 1,
      lastActivatedAt: 100,
      stabilityScore: 0.7,
      sourceHistory: ['external_stimulus'],
    })
    branch.bridgeRecords.push({
      id: 'bridge_a',
      sourceAssemblyId: 'a',
      targetAssemblyId: 'b',
      stage: 'teacher_free',
      createdBy: 'binding_teacher',
      teacherConfirmCount: 2,
      selfRecallSuccessCount: 2,
      failedRecallCount: 0,
      confidence: 0.8,
      teacherDependencyScore: 0.2,
      recallSuccessScore: 0.8,
      lastUsedAt: 100,
    })
    branch.contrastRecords.push({
      id: 'contrast_a_b',
      sourceAssemblyId: 'a',
      targetAssemblyId: 'b',
      relation: 'similar_but_different',
      confidence: 0.7,
      teacherAssisted: false,
      selfDiscovered: true,
      recurrenceCount: 2,
      lastUpdatedAt: 100,
    })
    branch.sequenceRecords.push({
      id: 'seq_a',
      assemblyIds: ['a'],
      transitionWeights: { b: 2 },
      recurrenceCount: 2,
      lastObservedAt: 100,
      predictionConfidence: 0.8,
      mismatchCount: 0,
    })
    branch.summary.teacherFreeBridgeCount = 1
    branch.summary.averageRecallSuccess = 0.5

    expect(determineSignalDevelopmentStage(branch)).toBe(8)
  })
})
