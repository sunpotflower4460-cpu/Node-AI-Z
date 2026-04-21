import { describe, expect, it } from 'vitest'
import { resolveGuardianReview } from '../resolveGuardianReview'
import { defaultGuardianPolicy } from '../guardianPolicy'
import type { GuardianReviewRequest } from '../guardianTypes'
import type { PromotionCandidate } from '../../coreTypes'
import type { PromotionValidationResult } from '../../promotion/promotionTypes'
import type { SchemaPattern } from '../../../memory/types'

const mockCandidate: PromotionCandidate = {
  id: 'candidate-1',
  type: 'schema',
  sourceData: {} as SchemaPattern,
  score: 0.82,
  reasons: ['Recurring pattern'],
  firstIdentifiedAt: 1,
  reinforcementCount: 6,
  approved: false,
  rejected: false,
}

const createRequest = (
  overrides: Partial<GuardianReviewRequest> = {}
): GuardianReviewRequest => {
  const validation: PromotionValidationResult = {
    candidateId: 'candidate-1',
    status: 'validated',
    riskLevel: 'medium',
    confidenceScore: 0.74,
    reasons: ['Needs guardian review'],
    cautionNotes: [],
  }

  return {
    id: 'guardian-req-1',
    candidate: mockCandidate,
    validation,
    requestedAt: 1,
    guardianMode: 'guardian_assisted',
    summary: ['Type: schema', 'Risk level: medium'],
    cautionNotes: ['Needs caution'],
    ...overrides,
  }
}

describe('resolveGuardianReview with AI sensei', () => {
  it('records a successful AI sensei review in mock mode', async () => {
    const result = await resolveGuardianReview(
      createRequest({
        validation: {
          candidateId: 'candidate-1',
          status: 'approved',
          riskLevel: 'medium',
          confidenceScore: 0.81,
          reasons: ['Borderline but acceptable'],
          cautionNotes: [],
        },
      }),
      defaultGuardianPolicy,
      undefined,
      {
        mode: 'mock',
        timeoutMs: 100,
      }
    )

    expect(result?.actor).toBe('ai_sensei')
    expect(result?.aiSensei?.mode).toBe('mock')
    expect(result?.aiSensei?.payload.requestId).toBe('guardian-req-1')
    expect(result?.aiSensei?.parsedReview?.success).toBe(true)
  })

  it('falls back safely when AI sensei remote mode is misconfigured', async () => {
    const result = await resolveGuardianReview(
      createRequest(),
      defaultGuardianPolicy,
      undefined,
      {
        mode: 'remote',
        timeoutMs: 100,
      }
    )

    expect(result?.decision).toBe('quarantine')
    expect(result?.aiSensei?.fallbackNotes.length).toBeGreaterThan(0)
    expect(result?.aiSensei?.parsedReview?.success ?? false).toBe(false)
  })
})
