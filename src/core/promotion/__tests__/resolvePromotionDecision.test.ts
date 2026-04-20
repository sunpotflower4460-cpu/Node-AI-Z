/**
 * Resolve Promotion Decision Tests - Phase M10
 */

import { describe, it, expect } from 'vitest'
import type { PromotionValidationResult } from '../promotionTypes'
import { resolvePromotionDecision, shouldReEvaluateCandidate } from '../resolvePromotionDecision'

describe('Resolve Promotion Decision', () => {
  it('should map approved status to approve decision', () => {
    const validation: PromotionValidationResult = {
      candidateId: 'test-1',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.9,
      reasons: ['High quality'],
      cautionNotes: [],
    }

    const { finalStatus, approvalRecord } = resolvePromotionDecision(validation)

    expect(finalStatus).toBe('approved')
    expect(approvalRecord.decision).toBe('approve')
    expect(approvalRecord.candidateId).toBe('test-1')
    expect(approvalRecord.actor).toBe('system')
  })

  it('should map rejected status to reject decision', () => {
    const validation: PromotionValidationResult = {
      candidateId: 'test-2',
      status: 'rejected',
      riskLevel: 'high',
      confidenceScore: 0.3,
      reasons: ['High risk'],
      cautionNotes: ['Unstable pattern'],
    }

    const { finalStatus, approvalRecord } = resolvePromotionDecision(validation)

    expect(finalStatus).toBe('rejected')
    expect(approvalRecord.decision).toBe('reject')
  })

  it('should map quarantined status to quarantine decision', () => {
    const validation: PromotionValidationResult = {
      candidateId: 'test-3',
      status: 'quarantined',
      riskLevel: 'medium',
      confidenceScore: 0.6,
      reasons: ['Needs more evidence'],
      cautionNotes: ['Limited recurrence'],
    }

    const { finalStatus, approvalRecord } = resolvePromotionDecision(validation)

    expect(finalStatus).toBe('quarantined')
    expect(approvalRecord.decision).toBe('quarantine')
  })

  it('should include risk and confidence in decision reason', () => {
    const validation: PromotionValidationResult = {
      candidateId: 'test-4',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.85,
      reasons: ['Excellent pattern', 'High recurrence'],
      cautionNotes: [],
    }

    const { approvalRecord } = resolvePromotionDecision(validation)

    expect(approvalRecord.reason).toContain('Risk=low')
    expect(approvalRecord.reason).toContain('Confidence=0.85')
  })

  it('should set system as actor for Phase M10', () => {
    const validation: PromotionValidationResult = {
      candidateId: 'test-5',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.9,
      reasons: [],
      cautionNotes: [],
    }

    const { approvalRecord } = resolvePromotionDecision(validation)

    expect(approvalRecord.actor).toBe('system')
  })

  it('should not re-evaluate approved decisions', () => {
    const approvalRecord = {
      id: 'approval-1',
      candidateId: 'test-1',
      decision: 'approve' as const,
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system' as const,
    }

    expect(shouldReEvaluateCandidate(approvalRecord)).toBe(false)
  })

  it('should not re-evaluate rejected decisions', () => {
    const approvalRecord = {
      id: 'approval-2',
      candidateId: 'test-2',
      decision: 'reject' as const,
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system' as const,
    }

    expect(shouldReEvaluateCandidate(approvalRecord)).toBe(false)
  })

  it('should not re-evaluate recent quarantine decisions', () => {
    const approvalRecord = {
      id: 'approval-3',
      candidateId: 'test-3',
      decision: 'quarantine' as const,
      reason: 'Test',
      createdAt: Date.now(), // Just now
      actor: 'system' as const,
    }

    expect(shouldReEvaluateCandidate(approvalRecord)).toBe(false)
  })

  it('should re-evaluate old quarantine decisions', () => {
    const approvalRecord = {
      id: 'approval-4',
      candidateId: 'test-4',
      decision: 'quarantine' as const,
      reason: 'Test',
      createdAt: Date.now() - 1000 * 60 * 10, // 10 minutes ago
      actor: 'system' as const,
    }

    expect(shouldReEvaluateCandidate(approvalRecord)).toBe(true)
  })
})
