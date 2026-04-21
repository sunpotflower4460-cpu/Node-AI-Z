/**
 * Guardian Review Queue Tests - Phase M11
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  enqueueGuardianReview,
  listGuardianReviewQueue,
  updateGuardianReviewQueueEntry,
  resolveGuardianReviewQueueEntry,
  clearGuardianReviewQueue,
  getGuardianReviewQueueState,
  restoreGuardianReviewQueueState,
} from '../guardianReviewQueue'
import type { GuardianReviewRequest, GuardianReviewResult } from '../guardianTypes'
import type { PromotionCandidate } from '../../coreTypes'
import type { PromotionValidationResult } from '../../promotion/promotionTypes'
import type { SchemaPattern } from '../../../memory/types'

describe('Guardian Review Queue', () => {
  beforeEach(() => {
    clearGuardianReviewQueue()
  })

  const createMockRequest = (): GuardianReviewRequest => {
    const mockCandidate: PromotionCandidate = {
      id: 'test-candidate',
      type: 'schema',
      sourceData: {} as SchemaPattern,
      score: 0.8,
      reasons: ['Test reason'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const mockValidation: PromotionValidationResult = {
      candidateId: 'test-candidate',
      status: 'validated',
      riskLevel: 'medium',
      confidenceScore: 0.7,
      reasons: ['Validated'],
      cautionNotes: [],
    }

    return {
      id: 'test-request',
      candidate: mockCandidate,
      validation: mockValidation,
      requestedAt: Date.now(),
      guardianMode: 'guardian_assisted',
      summary: ['Test summary'],
      cautionNotes: [],
    }
  }

  describe('enqueueGuardianReview', () => {
    it('should enqueue a guardian review request', () => {
      const request = createMockRequest()
      const entry = enqueueGuardianReview(request)

      expect(entry.status).toBe('queued')
      expect(entry.request).toEqual(request)
      expect(entry.id).toBeTruthy()
    })

    it('should add entry to queue', () => {
      const request = createMockRequest()
      enqueueGuardianReview(request)

      const queue = listGuardianReviewQueue()
      expect(queue.length).toBe(1)
    })
  })

  describe('listGuardianReviewQueue', () => {
    it('should list all queue entries', () => {
      const request1 = createMockRequest()
      const request2 = { ...createMockRequest(), id: 'test-request-2' }

      enqueueGuardianReview(request1)
      enqueueGuardianReview(request2)

      const queue = listGuardianReviewQueue()
      expect(queue.length).toBe(2)
    })

    it('should filter by status', () => {
      const request = createMockRequest()
      const entry = enqueueGuardianReview(request)

      updateGuardianReviewQueueEntry(entry.id, { status: 'resolved' })

      const queuedEntries = listGuardianReviewQueue('queued')
      const resolvedEntries = listGuardianReviewQueue('resolved')

      expect(queuedEntries.length).toBe(0)
      expect(resolvedEntries.length).toBe(1)
    })
  })

  describe('updateGuardianReviewQueueEntry', () => {
    it('should update queue entry', () => {
      const request = createMockRequest()
      const entry = enqueueGuardianReview(request)

      const updated = updateGuardianReviewQueueEntry(entry.id, {
        status: 'resolved',
      })

      expect(updated?.status).toBe('resolved')
    })

    it('should return undefined for non-existent entry', () => {
      const updated = updateGuardianReviewQueueEntry('non-existent', {
        status: 'resolved',
      })

      expect(updated).toBeUndefined()
    })
  })

  describe('resolveGuardianReviewQueueEntry', () => {
    it('should resolve queue entry with result', () => {
      const request = createMockRequest()
      const entry = enqueueGuardianReview(request)

      const result: GuardianReviewResult = {
        requestId: request.id,
        actor: 'ai_sensei',
        decision: 'approve',
        confidence: 0.9,
        reasons: ['Approved by AI sensei'],
        cautionNotes: [],
        createdAt: Date.now(),
      }

      const resolved = resolveGuardianReviewQueueEntry(entry.id, result)

      expect(resolved?.status).toBe('resolved')
      expect(resolved?.result).toEqual(result)
    })
  })

  describe('getGuardianReviewQueueState and restoreGuardianReviewQueueState', () => {
    it('should save and restore queue state', () => {
      const request = createMockRequest()
      enqueueGuardianReview(request)

      const state = getGuardianReviewQueueState()
      expect(state.length).toBe(1)

      clearGuardianReviewQueue()
      expect(listGuardianReviewQueue().length).toBe(0)

      restoreGuardianReviewQueueState(state)
      expect(listGuardianReviewQueue().length).toBe(1)
    })
  })
})
