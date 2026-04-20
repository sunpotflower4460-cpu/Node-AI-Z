/**
 * Promotion Queue Tests - Phase M10
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import {
  enqueuePromotionCandidate,
  listPromotionQueue,
  updatePromotionQueueEntry,
  findPromotionQueueEntry,
  clearAppliedPromotionEntries,
  clearPromotionQueue,
  getPromotionQueueState,
  restorePromotionQueueState,
} from '../promotionQueue'

describe('Promotion Queue', () => {
  beforeEach(() => {
    clearPromotionQueue()
  })

  it('should enqueue a promotion candidate', () => {
    const candidate: PromotionCandidate = {
      id: 'test-candidate-1',
      type: 'schema',
      sourceData: { key: 'test-schema' } as any,
      score: 0.8,
      reasons: ['High confidence'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const entry = enqueuePromotionCandidate(candidate)

    expect(entry.candidate).toEqual(candidate)
    expect(entry.status).toBe('queued')
    expect(entry.id).toBeTruthy()
  })

  it('should list all queued entries', () => {
    const candidate1: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: {} as any,
      score: 0.7,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 3,
      approved: false,
      rejected: false,
    }

    const candidate2: PromotionCandidate = {
      id: 'test-2',
      type: 'mixed_node',
      sourceData: {} as any,
      score: 0.9,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 7,
      approved: false,
      rejected: false,
    }

    enqueuePromotionCandidate(candidate1)
    enqueuePromotionCandidate(candidate2)

    const queue = listPromotionQueue()
    expect(queue).toHaveLength(2)
  })

  it('should filter by status', () => {
    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: {} as any,
      score: 0.8,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const entry = enqueuePromotionCandidate(candidate)
    updatePromotionQueueEntry(entry.id, { status: 'approved' })

    const queuedEntries = listPromotionQueue('queued')
    const approvedEntries = listPromotionQueue('approved')

    expect(queuedEntries).toHaveLength(0)
    expect(approvedEntries).toHaveLength(1)
  })

  it('should update a queue entry', () => {
    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: {} as any,
      score: 0.8,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const entry = enqueuePromotionCandidate(candidate)
    const updated = updatePromotionQueueEntry(entry.id, {
      status: 'validated',
      validation: {
        candidateId: candidate.id,
        status: 'validated',
        riskLevel: 'low',
        confidenceScore: 0.9,
        reasons: ['Test reason'],
        cautionNotes: [],
      },
    })

    expect(updated?.status).toBe('validated')
    expect(updated?.validation).toBeTruthy()
  })

  it('should find a queue entry by candidate ID', () => {
    const candidate: PromotionCandidate = {
      id: 'findable-candidate',
      type: 'schema',
      sourceData: {} as any,
      score: 0.8,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    enqueuePromotionCandidate(candidate)
    const found = findPromotionQueueEntry('findable-candidate')

    expect(found).toBeTruthy()
    expect(found?.candidate.id).toBe('findable-candidate')
  })

  it('should clear applied entries', () => {
    const candidate1: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: {} as any,
      score: 0.8,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const candidate2: PromotionCandidate = {
      id: 'test-2',
      type: 'schema',
      sourceData: {} as any,
      score: 0.9,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 7,
      approved: false,
      rejected: false,
    }

    const entry1 = enqueuePromotionCandidate(candidate1)
    const entry2 = enqueuePromotionCandidate(candidate2)

    updatePromotionQueueEntry(entry1.id, { status: 'applied' })
    updatePromotionQueueEntry(entry2.id, { status: 'approved' })

    const cleared = clearAppliedPromotionEntries()
    expect(cleared).toBe(1)

    const remaining = listPromotionQueue()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.status).toBe('approved')
  })

  it('should save and restore queue state', () => {
    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: {} as any,
      score: 0.8,
      reasons: ['Test'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    enqueuePromotionCandidate(candidate)
    const state = getPromotionQueueState()

    clearPromotionQueue()
    expect(listPromotionQueue()).toHaveLength(0)

    restorePromotionQueueState(state)
    expect(listPromotionQueue()).toHaveLength(1)
  })
})
