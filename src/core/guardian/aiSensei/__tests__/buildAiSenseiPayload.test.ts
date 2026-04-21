import { describe, expect, it } from 'vitest'
import { buildAiSenseiPayload } from '../buildAiSenseiPayload'
import type { GuardianReviewRequest } from '../../guardianTypes'
import type { PromotionCandidate } from '../../../coreTypes'
import type { PromotionValidationResult } from '../../../promotion/promotionTypes'
import type { SchemaPattern } from '../../../../memory/types'

const mockCandidate: PromotionCandidate = {
  id: 'candidate-1',
  type: 'schema',
  sourceData: {} as SchemaPattern,
  score: 0.82,
  reasons: ['Recurring schema'],
  firstIdentifiedAt: 1,
  reinforcementCount: 6,
  approved: false,
  rejected: false,
}

const mockValidation: PromotionValidationResult = {
  candidateId: 'candidate-1',
  status: 'validated',
  riskLevel: 'medium',
  confidenceScore: 0.74,
  reasons: ['Needs guardian review'],
  cautionNotes: ['Borderline confidence'],
}

describe('buildAiSenseiPayload', () => {
  it('builds a minimal payload from guardian review request data', () => {
    const request: GuardianReviewRequest = {
      id: 'guardian-req-1',
      candidate: mockCandidate,
      validation: mockValidation,
      requestedAt: 10,
      guardianMode: 'guardian_assisted',
      summary: ['Type: schema', 'Risk level: medium'],
      cautionNotes: ['Borderline confidence'],
    }

    expect(buildAiSenseiPayload(request)).toEqual({
      requestId: 'guardian-req-1',
      guardianMode: 'guardian_assisted',
      candidateKind: 'schema',
      confidenceScore: 0.74,
      riskLevel: 'medium',
      summary: ['Type: schema', 'Risk level: medium'],
      cautionNotes: ['Borderline confidence'],
    })
  })

  it('normalizes human-required requests into AI sensei payloads without extra state', () => {
    const request: GuardianReviewRequest = {
      id: 'guardian-req-2',
      candidate: mockCandidate,
      validation: {
        ...mockValidation,
        riskLevel: 'high',
      },
      requestedAt: 10,
      guardianMode: 'human_required',
      summary: ['Risk level: high'],
      cautionNotes: ['Human escalation'],
    }

    const payload = buildAiSenseiPayload(request)

    expect(payload.guardianMode).toBe('human_required')
    expect(payload.summary).toEqual(['Risk level: high'])
    expect(payload.cautionNotes).toEqual(['Human escalation'])
  })
})
