import { beforeEach, describe, expect, it } from 'vitest'
import { queueHumanReviewSummary, listPendingHumanReviews, listResolvedHumanReviews, submitHumanReviewDecision, clearHumanReviewState } from '../humanReviewActions'
import { buildHumanReviewSummary } from '../buildHumanReviewSummary'
import { enqueueGuardianReview, clearGuardianReviewQueue } from '../../guardianReviewQueue'
import { enqueuePromotionCandidate, clearPromotionQueue } from '../../../promotion/promotionQueue'
import type { PromotionCandidate } from '../../../coreTypes'
import type { PromotionValidationResult } from '../../../promotion/promotionTypes'

describe('humanReviewActions', () => {
  beforeEach(() => {
    clearHumanReviewState()
    clearGuardianReviewQueue()
    clearPromotionQueue()
  })

  it('queues pending reviews and resolves with human decision', () => {
    const candidate: PromotionCandidate = {
      id: 'cand-1',
      type: 'schema',
      sourceData: {},
      score: 0.9,
      reasons: ['Recurring pattern'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: candidate.id,
      status: 'approved',
      riskLevel: 'high',
      confidenceScore: 0.8,
      reasons: ['Strong evidence'],
      cautionNotes: ['needs human eyes'],
    }

    enqueuePromotionCandidate(candidate)
    enqueueGuardianReview({
      id: 'guardian-req-1',
      candidate,
      validation,
      requestedAt: Date.now(),
      guardianMode: 'human_required',
      summary: ['Type: schema'],
      cautionNotes: validation.cautionNotes,
    })

    queueHumanReviewSummary(
      buildHumanReviewSummary({
        candidate,
        validation,
        sourceBranchId: 'branch-1',
      })
    )

    const pending = listPendingHumanReviews()
    expect(pending.length).toBe(1)
    expect(pending[0].reviewStatus).toBe('pending')

    submitHumanReviewDecision({
      candidateId: candidate.id,
      decision: 'approve',
      reason: 'looks stable after review',
    })

    const resolved = listResolvedHumanReviews()
    expect(resolved.length).toBe(1)
    expect(resolved[0].record?.decision).toBe('approve')
    expect(resolved[0].promotionStatus).toBe('approved')
  })
})
