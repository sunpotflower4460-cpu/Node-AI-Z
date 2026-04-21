import { describe, expect, it } from 'vitest'
import { guardianDecisionResolver } from '../guardianDecisionResolver'
import type { PromotionValidationResult } from '../../promotion/promotionTypes'

const mockValidation: PromotionValidationResult = {
  candidateId: 'candidate-1',
  status: 'validated',
  riskLevel: 'medium',
  confidenceScore: 0.72,
  reasons: ['Needs review'],
  cautionNotes: [],
}

describe('guardianDecisionResolver with AI sensei', () => {
  it('approves guardian-assisted candidates when AI sensei approves', () => {
    const result = guardianDecisionResolver(
      mockValidation,
      {
        requestId: 'guardian-req-1',
        actor: 'ai_sensei',
        decision: 'approve',
        confidence: 0.9,
        reasons: ['AI sensei approved'],
        cautionNotes: [],
        createdAt: 1,
      },
      'guardian_assisted'
    )

    expect(result.finalStatus).toBe('approved')
    expect(result.guardianActor).toBe('ai_sensei')
  })

  it('keeps human-required candidates on hold even when AI sensei approves', () => {
    const result = guardianDecisionResolver(
      mockValidation,
      {
        requestId: 'guardian-req-2',
        actor: 'ai_sensei',
        decision: 'approve',
        confidence: 0.9,
        reasons: ['AI sensei approved'],
        cautionNotes: [],
        createdAt: 1,
      },
      'human_required'
    )

    expect(result.finalStatus).toBe('quarantined')
    expect(result.guardianDecision).toBe('hold_for_review')
  })
})
