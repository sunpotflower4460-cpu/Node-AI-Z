import { describe, expect, it } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import { attachConsistencyToPromotionCandidate } from '../attachConsistencyToPromotionCandidate'

describe('attachConsistencyToPromotionCandidate', () => {
  it('attaches support metadata and returns a consistency record', () => {
    const candidate: PromotionCandidate = {
      id: 'candidate-1',
      type: 'schema',
      sourceData: {
        id: 'schema-1',
        key: 'calm-bridge',
        dominantProtoMeaningIds: ['meaning-1'],
        dominantTextureTags: ['calm'],
        optionTendencyKeys: ['bridge'],
        somaticSignatureKeys: ['steady'],
        recurrenceCount: 7,
        strength: 0.82,
        confidence: 0.8,
        supportingTraceIds: ['trace-1'],
        firstSeenTurn: 1,
        lastReinforcedTurn: 7,
      },
      score: 0.9,
      reasons: ['stable'],
      firstIdentifiedAt: 1,
      reinforcementCount: 7,
      approved: false,
      rejected: false,
    }

    const attached = attachConsistencyToPromotionCandidate(candidate, 'branch-self', [
      {
        branchId: 'branch-self',
        schemaKeys: ['calm-bridge'],
        mixedPatternKeys: [],
        optionTendencyKeys: ['bridge'],
        metaphorKeys: ['calm'],
        updatedAt: 1,
      },
      {
        branchId: 'branch-a',
        schemaKeys: ['calm-bridge'],
        mixedPatternKeys: [],
        optionTendencyKeys: ['bridge'],
        metaphorKeys: ['calm'],
        updatedAt: 1,
      },
    ])

    expect(attached.candidate.crossBranchSupport?.supportCount).toBe(1)
    expect(attached.candidate.crossBranchSupport?.matches?.[0]?.branchId).toBe('branch-a')
    expect(attached.record.candidateId).toBe(candidate.id)
    expect(attached.record.consistencyScore).toBeGreaterThan(0)
  })
})
