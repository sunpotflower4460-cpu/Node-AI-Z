/**
 * Validate Promotion Candidate Tests - Phase M10
 */

import { describe, it, expect } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import type { SchemaPattern } from '../../../memory/types'
import { validatePromotionCandidate } from '../validatePromotionCandidate'
import { createEmptyPersonalBranch } from '../../personalBranch'
import { createEmptySharedTrunk } from '../../sharedTrunk'

describe('Validate Promotion Candidate', () => {
  it('should approve high-quality, low-risk candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'excellent-pattern',
      category: 'test',
      strength: 0.9,
      confidence: 0.9,
      recurrenceCount: 12,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1', 't2', 't3', 't4'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: schema,
      score: 0.95,
      reasons: ['Excellent strength', 'High confidence', 'Great recurrence', 'Many supporting traces'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      reinforcementCount: 12,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const validation = validatePromotionCandidate(candidate, branch, trunk)

    expect(validation.status).toBe('approved')
    expect(validation.riskLevel).toBe('low')
    expect(validation.confidenceScore).toBeGreaterThan(0.7)
    expect(validation.reasons.some((r) => r.toLowerCase().includes('approved'))).toBe(true)
  })

  it('should reject high-risk candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'poor-pattern',
      category: 'test',
      strength: 0.2,
      confidence: 0.3,
      recurrenceCount: 1,
      firstSeenTurn: 100,
      lastReinforcedTurn: 100,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-2',
      type: 'schema',
      sourceData: schema,
      score: 0.3,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 1,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const validation = validatePromotionCandidate(candidate, branch, trunk)

    expect(validation.status).toBe('rejected')
    expect(validation.riskLevel).toBe('high')
    expect(validation.reasons.some((r) => r.toLowerCase().includes('reject'))).toBe(true)
  })

  it('should quarantine medium-risk candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'moderate-pattern',
      category: 'test',
      strength: 0.65,
      confidence: 0.7,
      recurrenceCount: 5,
      firstSeenTurn: 40,
      lastReinforcedTurn: 85,
      supportingTraceIds: ['t1', 't2', 't3'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-3',
      type: 'schema',
      sourceData: schema,
      score: 0.7,
      reasons: ['Moderate quality', 'Decent recurrence'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const validation = validatePromotionCandidate(candidate, branch, trunk)

    expect(validation.status).toBe('quarantined')
    expect(['low', 'medium', 'high']).toContain(validation.riskLevel)
    expect(validation.reasons.some((r) => r.toLowerCase().includes('quarantine'))).toBe(true)
  })

  it('should include caution notes for early or risky promotions', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'early-pattern',
      category: 'test',
      strength: 0.7,
      confidence: 0.7,
      recurrenceCount: 3,
      firstSeenTurn: 98,
      lastReinforcedTurn: 100,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-4',
      type: 'schema',
      sourceData: schema,
      score: 0.7,
      reasons: ['Decent quality'],
      firstIdentifiedAt: Date.now() - 1000 * 30, // 30 seconds ago
      reinforcementCount: 3,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const validation = validatePromotionCandidate(candidate, branch, trunk)

    expect(validation.cautionNotes.length).toBeGreaterThan(0)
    expect(
      validation.cautionNotes.some(
        (n) => n.toLowerCase().includes('early') || n.toLowerCase().includes('recent')
      )
    ).toBe(true)
  })

  it('should return validation result with all required fields', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'test-pattern',
      category: 'test',
      strength: 0.7,
      confidence: 0.75,
      recurrenceCount: 6,
      firstSeenTurn: 40,
      lastReinforcedTurn: 90,
      supportingTraceIds: ['t1', 't2', 't3'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-5',
      type: 'schema',
      sourceData: schema,
      score: 0.75,
      reasons: ['Good pattern'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60,
      reinforcementCount: 6,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const validation = validatePromotionCandidate(candidate, branch, trunk)

    expect(validation.candidateId).toBe(candidate.id)
    expect(validation.status).toBeDefined()
    expect(validation.riskLevel).toBeDefined()
    expect(validation.confidenceScore).toBeGreaterThanOrEqual(0)
    expect(validation.confidenceScore).toBeLessThanOrEqual(1)
    expect(validation.reasons).toBeInstanceOf(Array)
    expect(validation.cautionNotes).toBeInstanceOf(Array)
  })
})
