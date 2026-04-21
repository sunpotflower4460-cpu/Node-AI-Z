import { describe, expect, it } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import { comparePromotionCandidateAcrossBranches } from '../comparePromotionCandidateAcrossBranches'

describe('comparePromotionCandidateAcrossBranches', () => {
  it('excludes the current branch and returns exact/partial matches', () => {
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

    const matches = comparePromotionCandidateAcrossBranches(candidate, 'branch-self', [
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
      {
        branchId: 'branch-b',
        schemaKeys: ['other-pattern'],
        mixedPatternKeys: [],
        optionTendencyKeys: ['bridge'],
        metaphorKeys: [],
        updatedAt: 1,
      },
    ])

    expect(matches).toHaveLength(2)
    expect(matches[0]?.branchId).toBe('branch-a')
    expect(matches[0]?.similarityScore).toBeGreaterThan(matches[1]?.similarityScore ?? 0)
    expect(matches.some((match) => match.branchId === 'branch-self')).toBe(false)
  })
})
