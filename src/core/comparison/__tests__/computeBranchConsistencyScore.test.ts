import { describe, expect, it } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import { computeBranchConsistencyScore } from '../computeBranchConsistencyScore'

describe('computeBranchConsistencyScore', () => {
  it('raises consistency when multiple branches support the candidate', () => {
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

    const strongScore = computeBranchConsistencyScore(candidate, [
      {
        branchId: 'branch-a',
        schemaKeys: ['calm-bridge'],
        mixedPatternKeys: [],
        optionTendencyKeys: ['bridge'],
        metaphorKeys: ['calm'],
        updatedAt: 1,
      },
      {
        branchId: 'branch-b',
        schemaKeys: ['calm-bridge'],
        mixedPatternKeys: [],
        optionTendencyKeys: ['bridge'],
        metaphorKeys: ['calm'],
        updatedAt: 1,
      },
    ])
    const weakScore = computeBranchConsistencyScore(candidate, [
      {
        branchId: 'branch-a',
        schemaKeys: ['different-pattern'],
        mixedPatternKeys: [],
        optionTendencyKeys: [],
        metaphorKeys: [],
        updatedAt: 1,
      },
    ])

    expect(strongScore.supportCount).toBe(2)
    expect(strongScore.consistencyScore).toBeGreaterThan(weakScore.consistencyScore)
    expect(weakScore.notes).toContain('no meaningful cross-branch support yet')
  })
})
