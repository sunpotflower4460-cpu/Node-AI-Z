import { describe, expect, it } from 'vitest'
import { buildHumanReviewSummary } from '../buildHumanReviewSummary'
import type { PromotionCandidate } from '../../../coreTypes'
import type { PromotionValidationResult } from '../../../promotion/promotionTypes'

describe('buildHumanReviewSummary', () => {
  it('creates a concise summary with risk, confidence, and impact', () => {
    const candidate: PromotionCandidate = {
      id: 'cand-1',
      type: 'schema',
      sourceData: {},
      score: 0.82,
      reasons: ['Recurring alignment'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 4,
      approved: false,
      rejected: false,
      crossBranchSupport: {
        supportCount: 2,
        comparedBranchCount: 3,
        consistencyScore: 0.74,
        notes: ['cross-branch recurring pattern detected'],
      },
    }

    const validation: PromotionValidationResult = {
      candidateId: 'cand-1',
      status: 'approved',
      riskLevel: 'medium',
      confidenceScore: 0.78,
      reasons: ['Stable pattern', 'Low volatility'],
      cautionNotes: ['Watch rollout effect'],
    }

    const summary = buildHumanReviewSummary({
      candidate,
      validation,
      sourceBranchId: 'branch-1',
    })

    expect(summary.candidateId).toBe(candidate.id)
    expect(summary.riskLevel).toBe('medium')
    expect(summary.crossBranchSupportCount).toBe(2)
    expect(summary.comparedBranchCount).toBe(3)
    expect(summary.consistencyScore).toBeCloseTo(0.74)
    expect(summary.summary.some((line) => line.includes('Promotion score'))).toBe(true)
    expect(summary.summary.some((line) => line.includes('Consistency Score'))).toBe(true)
    expect(summary.summary.some((line) => line.toLowerCase().includes('trunk'))).toBe(true)
    expect(summary.cautionNotes.length).toBeGreaterThan(0)
    expect(summary.consistencyNotes).toContain('cross-branch recurring pattern detected')
  })
})
