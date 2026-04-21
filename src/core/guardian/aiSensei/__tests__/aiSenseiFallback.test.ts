import { describe, expect, it } from 'vitest'
import { buildAiSenseiFallbackReview } from '../aiSenseiFallback'
import type { GuardianReviewRequest } from '../../guardianTypes'
import type { PromotionCandidate } from '../../../coreTypes'
import type { PromotionValidationResult } from '../../../promotion/promotionTypes'
import type { SchemaPattern } from '../../../../memory/types'

const mockCandidate: PromotionCandidate = {
  id: 'candidate-1',
  type: 'schema',
  sourceData: {} as SchemaPattern,
  score: 0.8,
  reasons: ['Recurring pattern'],
  firstIdentifiedAt: 1,
  reinforcementCount: 6,
  approved: false,
  rejected: false,
}

const mockValidation: PromotionValidationResult = {
  candidateId: 'candidate-1',
  status: 'validated',
  riskLevel: 'medium',
  confidenceScore: 0.72,
  reasons: ['Needs review'],
  cautionNotes: ['Borderline confidence'],
}

describe('buildAiSenseiFallbackReview', () => {
  it('quarantines guardian-assisted candidates on fallback', () => {
    const request: GuardianReviewRequest = {
      id: 'guardian-req-1',
      candidate: mockCandidate,
      validation: mockValidation,
      requestedAt: 1,
      guardianMode: 'guardian_assisted',
      summary: ['Medium risk'],
      cautionNotes: ['Borderline confidence'],
    }

    const fallback = buildAiSenseiFallbackReview(request, ['timeout'])

    expect(fallback.decision).toBe('quarantine')
    expect(fallback.fallbackNotes).toEqual(['timeout'])
  })

  it('holds human-required candidates for review on fallback', () => {
    const request: GuardianReviewRequest = {
      id: 'guardian-req-2',
      candidate: mockCandidate,
      validation: {
        ...mockValidation,
        riskLevel: 'high',
      },
      requestedAt: 1,
      guardianMode: 'human_required',
      summary: ['High risk'],
      cautionNotes: ['Escalate'],
    }

    const fallback = buildAiSenseiFallbackReview(request, ['malformed response'])

    expect(fallback.decision).toBe('hold_for_review')
    expect(fallback.reasons[0]).toContain('safe guardian fallback')
  })
})
