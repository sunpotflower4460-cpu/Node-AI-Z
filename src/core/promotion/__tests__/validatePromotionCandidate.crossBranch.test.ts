import { describe, expect, it } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import { createEmptyPersonalBranch } from '../../personalBranch'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { validatePromotionCandidate } from '../validatePromotionCandidate'

describe('validatePromotionCandidate cross-branch support', () => {
  it('leans toward quarantine when cross-branch support is missing', () => {
    const candidate: PromotionCandidate = {
      id: 'candidate-low-support',
      type: 'schema',
      sourceData: {
        id: 'schema-1',
        key: 'narrow-pattern',
        dominantProtoMeaningIds: ['meaning-1'],
        dominantTextureTags: ['narrow'],
        optionTendencyKeys: ['hold'],
        somaticSignatureKeys: ['tight'],
        recurrenceCount: 6,
        strength: 0.82,
        confidence: 0.8,
        supportingTraceIds: ['trace-1'],
        firstSeenTurn: 1,
        lastReinforcedTurn: 7,
      },
      score: 0.88,
      reasons: ['stable'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60 * 2,
      reinforcementCount: 6,
      approved: false,
      rejected: false,
      crossBranchSupport: {
        supportCount: 0,
        comparedBranchCount: 3,
        consistencyScore: 0.1,
        notes: ['no meaningful cross-branch support yet'],
      },
    }

    const validation = validatePromotionCandidate(
      candidate,
      createEmptyPersonalBranch('branch-1'),
      createEmptySharedTrunk()
    )

    expect(validation.status).toBe('quarantined')
    expect(validation.cautionNotes.some((note) => note.includes('cross-branch'))).toBe(true)
  })

  it('leans toward approval when multiple branches support the candidate', () => {
    const candidate: PromotionCandidate = {
      id: 'candidate-supported',
      type: 'schema',
      sourceData: {
        id: 'schema-2',
        key: 'shared-pattern',
        dominantProtoMeaningIds: ['meaning-1'],
        dominantTextureTags: ['steady'],
        optionTendencyKeys: ['bridge'],
        somaticSignatureKeys: ['grounded'],
        recurrenceCount: 10,
        strength: 0.92,
        confidence: 0.88,
        supportingTraceIds: ['trace-1'],
        firstSeenTurn: 1,
        lastReinforcedTurn: 10,
      },
      score: 0.95,
      reasons: ['stable', 'general'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60 * 3,
      reinforcementCount: 10,
      approved: false,
      rejected: false,
      crossBranchSupport: {
        supportCount: 2,
        comparedBranchCount: 3,
        consistencyScore: 0.82,
        notes: ['cross-branch recurring pattern detected'],
      },
    }

    const validation = validatePromotionCandidate(
      candidate,
      createEmptyPersonalBranch('branch-1'),
      createEmptySharedTrunk()
    )

    expect(validation.status).toBe('approved')
    expect(validation.reasons).toContain('Recurring across multiple branches')
  })
})
