/**
 * Derive Promotion Risk Tests - Phase M10
 */

import { describe, it, expect } from 'vitest'
import type { PromotionCandidate, PersonalBranchState, SharedTrunkState } from '../../coreTypes'
import type { SchemaPattern } from '../../../memory/types'
import { derivePromotionRisk } from '../derivePromotionRisk'
import { createEmptyPersonalBranch } from '../../personalBranch'
import { createEmptySharedTrunk } from '../../sharedTrunk'

describe('Derive Promotion Risk', () => {
  it('should assess low risk for high-quality candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'high-quality-pattern',
      category: 'test',
      strength: 0.9,
      confidence: 0.85,
      recurrenceCount: 10,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1', 't2', 't3'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: schema,
      score: 0.9,
      reasons: ['High strength', 'High confidence', 'Good recurrence'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      reinforcementCount: 10,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const risk = derivePromotionRisk(candidate, branch, trunk)

    expect(risk.riskLevel).toBe('low')
    expect(risk.riskScore).toBeLessThan(0.4)
  })

  it('should assess high risk for low-quality candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'low-quality-pattern',
      category: 'test',
      strength: 0.3,
      confidence: 0.4,
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
      score: 0.4,
      reasons: ['Low confidence'],
      firstIdentifiedAt: Date.now() - 1000, // Just now
      reinforcementCount: 1,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const risk = derivePromotionRisk(candidate, branch, trunk)

    expect(risk.riskLevel).toBe('high')
    expect(risk.riskScore).toBeGreaterThan(0.6)
  })

  it('should assess medium risk for moderate candidates', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'moderate-pattern',
      category: 'test',
      strength: 0.6,
      confidence: 0.65,
      recurrenceCount: 4,
      firstSeenTurn: 50,
      lastReinforcedTurn: 80,
      supportingTraceIds: ['t1', 't2'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-3',
      type: 'schema',
      sourceData: schema,
      score: 0.65,
      reasons: ['Moderate strength', 'Moderate confidence'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      reinforcementCount: 4,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const risk = derivePromotionRisk(candidate, branch, trunk)

    expect(risk.riskLevel).toBe('medium')
    expect(risk.riskScore).toBeGreaterThanOrEqual(0.35)
    expect(risk.riskScore).toBeLessThan(0.65)
  })

  it('should lower risk for candidates reinforcing existing trunk patterns', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'existing-pattern',
      category: 'test',
      strength: 0.7,
      confidence: 0.7,
      recurrenceCount: 5,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1', 't2'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-4',
      type: 'schema',
      sourceData: schema,
      score: 0.75,
      reasons: ['Reinforces trunk'],
      firstIdentifiedAt: Date.now() - 1000 * 60 * 60,
      reinforcementCount: 5,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    // Add the same pattern to trunk
    trunk.schemaPatterns.push({ ...schema })

    const risk = derivePromotionRisk(candidate, branch, trunk)

    expect(risk.notes.some((n) => n.includes('Reinforces'))).toBe(true)
    expect(risk.riskScore).toBeLessThan(0.6)
  })

  it('should include appropriate risk notes', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'test-pattern',
      category: 'test',
      strength: 0.4,
      confidence: 0.45,
      recurrenceCount: 2,
      firstSeenTurn: 95,
      lastReinforcedTurn: 98,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-5',
      type: 'schema',
      sourceData: schema,
      score: 0.5,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 2,
      approved: false,
      rejected: false,
    }

    const branch = createEmptyPersonalBranch('test-user')
    const trunk = createEmptySharedTrunk()

    const risk = derivePromotionRisk(candidate, branch, trunk)

    expect(risk.notes.length).toBeGreaterThan(0)
    expect(risk.notes.some((n) => n.toLowerCase().includes('low') || n.toLowerCase().includes('moderate'))).toBe(true)
  })
})
