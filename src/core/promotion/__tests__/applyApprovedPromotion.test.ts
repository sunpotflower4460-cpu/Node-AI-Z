/**
 * Apply Approved Promotion Tests - Phase M10
 */

import { describe, it, expect } from 'vitest'
import type { PromotionCandidate, SharedTrunkState } from '../../coreTypes'
import type { SchemaPattern } from '../../../memory/types'
import type { MixedLatentNode } from '../../../node/mixedNodeTypes'
import type { PromotionValidationResult } from '../promotionTypes'
import { applyApprovedPromotion } from '../applyApprovedPromotion'
import { createEmptySharedTrunk } from '../../sharedTrunk'

describe('Apply Approved Promotion', () => {
  it('should add new schema to trunk', () => {
    const schema: SchemaPattern = {
      id: 'new-schema',
      key: 'new-pattern',
      category: 'test',
      strength: 0.8,
      confidence: 0.8,
      recurrenceCount: 6,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1', 't2'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-1',
      type: 'schema',
      sourceData: schema,
      score: 0.8,
      reasons: ['Good pattern'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 6,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-1',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.85,
      reasons: [],
      cautionNotes: [],
    }

    const trunk = createEmptySharedTrunk()
    const result = applyApprovedPromotion(trunk, candidate, validation)

    expect(result.success).toBe(true)
    expect(result.trunkUpdated).toBe(true)
    expect(result.nextTrunk.schemaPatterns).toHaveLength(1)
    expect(result.nextTrunk.schemaPatterns[0]?.key).toBe('new-pattern')
  })

  it('should reinforce existing schema in trunk', () => {
    const schema: SchemaPattern = {
      id: 'existing-schema',
      key: 'existing-pattern',
      category: 'test',
      strength: 0.6,
      confidence: 0.6,
      recurrenceCount: 3,
      firstSeenTurn: 1,
      lastReinforcedTurn: 30,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const trunk = createEmptySharedTrunk()
    trunk.schemaPatterns.push({ ...schema })

    const reinforcementSchema: SchemaPattern = {
      ...schema,
      id: 'reinforcement-schema',
      recurrenceCount: 2,
    }

    const candidate: PromotionCandidate = {
      id: 'test-2',
      type: 'schema',
      sourceData: reinforcementSchema,
      score: 0.7,
      reasons: ['Reinforcement'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 2,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-2',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.8,
      reasons: [],
      cautionNotes: [],
    }

    const result = applyApprovedPromotion(trunk, candidate, validation)

    expect(result.success).toBe(true)
    expect(result.trunkUpdated).toBe(true)
    expect(result.nextTrunk.schemaPatterns).toHaveLength(1)
    expect(result.nextTrunk.schemaPatterns[0]?.strength).toBeGreaterThan(schema.strength)
  })

  it('should add new mixed node to trunk', () => {
    const node: MixedLatentNode = {
      id: 'new-node',
      key: 'new-mixed-node',
      axes: ['emotion', 'context'],
      salience: 0.7,
      coherence: 0.75,
      novelty: 0.3,
      tags: ['test'],
    }

    const candidate: PromotionCandidate = {
      id: 'test-3',
      type: 'mixed_node',
      sourceData: node,
      score: 0.75,
      reasons: ['Good node'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 1,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-3',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.8,
      reasons: [],
      cautionNotes: [],
    }

    const trunk = createEmptySharedTrunk()
    const result = applyApprovedPromotion(trunk, candidate, validation)

    expect(result.success).toBe(true)
    expect(result.trunkUpdated).toBe(true)
    expect(result.nextTrunk.promotedMixedNodes).toHaveLength(1)
    expect(result.nextTrunk.promotedMixedNodes[0]?.key).toBe('new-mixed-node')
  })

  it('should apply changes conservatively', () => {
    const schema: SchemaPattern = {
      id: 'strong-schema',
      key: 'strong-pattern',
      category: 'test',
      strength: 0.95,
      confidence: 0.95,
      recurrenceCount: 20,
      firstSeenTurn: 1,
      lastReinforcedTurn: 100,
      supportingTraceIds: ['t1', 't2', 't3'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-4',
      type: 'schema',
      sourceData: schema,
      score: 0.95,
      reasons: ['Excellent'],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 20,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-4',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.95,
      reasons: [],
      cautionNotes: [],
    }

    const trunk = createEmptySharedTrunk()
    const result = applyApprovedPromotion(trunk, candidate, validation)

    // Should cap initial strength/confidence
    const addedSchema = result.nextTrunk.schemaPatterns[0]
    expect(addedSchema?.strength).toBeLessThanOrEqual(0.7)
    expect(addedSchema?.confidence).toBeLessThanOrEqual(0.7)
  })

  it('should increment trunk version', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'test-pattern',
      category: 'test',
      strength: 0.7,
      confidence: 0.7,
      recurrenceCount: 5,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-5',
      type: 'schema',
      sourceData: schema,
      score: 0.7,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-5',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.75,
      reasons: [],
      cautionNotes: [],
    }

    const trunk = createEmptySharedTrunk()
    const initialVersion = trunk.version

    const result = applyApprovedPromotion(trunk, candidate, validation)

    expect(result.nextTrunk.version).toBe(initialVersion + 1)
  })

  it('should add promotion note to trunk', () => {
    const schema: SchemaPattern = {
      id: 'test-schema',
      key: 'test-pattern',
      category: 'test',
      strength: 0.7,
      confidence: 0.7,
      recurrenceCount: 5,
      firstSeenTurn: 1,
      lastReinforcedTurn: 50,
      supportingTraceIds: ['t1'],
      tags: [],
    }

    const candidate: PromotionCandidate = {
      id: 'test-6',
      type: 'schema',
      sourceData: schema,
      score: 0.7,
      reasons: [],
      firstIdentifiedAt: Date.now(),
      reinforcementCount: 5,
      approved: true,
      rejected: false,
    }

    const validation: PromotionValidationResult = {
      candidateId: 'test-6',
      status: 'approved',
      riskLevel: 'low',
      confidenceScore: 0.75,
      reasons: [],
      cautionNotes: [],
    }

    const trunk = createEmptySharedTrunk()
    const initialNotesLength = trunk.notes.length

    const result = applyApprovedPromotion(trunk, candidate, validation)

    expect(result.nextTrunk.notes.length).toBeGreaterThan(initialNotesLength)
    expect(result.nextTrunk.notes.some((n) => n.includes('Promoted'))).toBe(true)
  })
})
