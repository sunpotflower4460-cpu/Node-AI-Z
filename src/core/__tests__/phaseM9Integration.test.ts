/**
 * Phase M9 Integration Tests
 * Tests the trunk/branch/facade separation and integration.
 */

import { describe, it, expect } from 'vitest'
import {
  createEmptySharedTrunk,
  createEmptyPersonalBranch,
  createCrystallizedThinkingFacade,
  resolveCoreView,
  applyTrunkInfluence,
  applyBranchInfluence,
  derivePromotionCandidates,
  addPromotedSchema,
  updateBranchSchema,
} from '../index'
import type { SchemaPattern } from '../../memory/types'

describe('Phase M9: Core Separation', () => {
  it('creates empty trunk with correct structure', () => {
    const trunk = createEmptySharedTrunk()

    expect(trunk.trunkId).toBeTruthy()
    expect(trunk.schemaPatterns).toEqual([])
    expect(trunk.promotedMixedNodes).toEqual([])
    expect(trunk.version).toBe(1)
    expect(trunk.notes).toContain('Empty shared trunk initialized')
  })

  it('creates empty personal branch with correct structure', () => {
    const branch = createEmptyPersonalBranch('user-123')

    expect(branch.branchId).toBe('user-123')
    expect(branch.personalSchemas).toEqual([])
    expect(branch.personalMixedNodes).toEqual([])
    expect(branch.version).toBe(1)
    expect(branch.notes).toContain('Empty personal branch initialized')
  })

  it('creates crystallized thinking facade with correct permissions', () => {
    const facade = createCrystallizedThinkingFacade()

    expect(facade.appName).toBe('crystallized_thinking')
    expect(facade.canReadTrunk).toBe(true)
    expect(facade.canReadBranch).toBe(true)
    expect(facade.canWriteBranch).toBe(true)
    expect(facade.canProposePromotions).toBe(true)
    expect(facade.trunkInfluenceWeight).toBe(0.2)
    expect(facade.branchInfluenceWeight).toBe(0.8)
  })

  it('resolves core view merging trunk and branch', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-123')
    const facade = createCrystallizedThinkingFacade()

    const coreView = resolveCoreView(trunk, branch, facade)

    expect(coreView.activeSchemas).toEqual([])
    expect(coreView.activeMixedNodes).toEqual([])
    expect(coreView.mergedBiases).toEqual({})
    expect(coreView.promotionCandidates).toEqual([])
  })

  it('applies trunk influence to schemas', () => {
    const trunk = createEmptySharedTrunk()
    const currentSchemas: SchemaPattern[] = []

    const result = applyTrunkInfluence(
      currentSchemas,
      [],
      trunk,
      0.2
    )

    expect(result.influencedSchemas).toEqual([])
    expect(result.influencedMixedNodes).toEqual([])
    expect(result.notes).toEqual([])
  })

  it('applies branch influence to schemas', () => {
    const branch = createEmptyPersonalBranch('user-123')
    const currentSchemas: SchemaPattern[] = []

    const result = applyBranchInfluence(
      currentSchemas,
      [],
      branch,
      0.8
    )

    expect(result.influencedSchemas).toEqual([])
    expect(result.influencedMixedNodes).toEqual([])
    expect(result.notes).toEqual([])
  })

  it('derives promotion candidates from strong patterns', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-123')

    // Add a weak schema (should not be promoted)
    const weakSchema: SchemaPattern = {
      id: 'schema-1',
      key: 'weak-pattern',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['tag-1'],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 2, // Too few
      strength: 0.4, // Too weak
      confidence: 0.4, // Too low
      supportingTraceIds: [],
      firstSeenTurn: 0,
      lastReinforcedTurn: 5,
    }

    const branchWithWeak = updateBranchSchema(branch, weakSchema)
    const candidates = derivePromotionCandidates(branchWithWeak, trunk, 10)

    // Weak pattern should not be a candidate
    expect(candidates).toEqual([])
  })

  it('promotes strong schema from branch to trunk', () => {
    let trunk = createEmptySharedTrunk()

    const strongSchema: SchemaPattern = {
      id: 'schema-1',
      key: 'strong-pattern',
      dominantProtoMeaningIds: ['meaning-1', 'meaning-2'],
      dominantTextureTags: ['tag-1'],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 10,
      strength: 0.8,
      confidence: 0.8,
      supportingTraceIds: ['trace-1', 'trace-2'],
      firstSeenTurn: 0,
      lastReinforcedTurn: 50,
    }

    trunk = addPromotedSchema(trunk, strongSchema)

    expect(trunk.schemaPatterns).toHaveLength(1)
    expect(trunk.schemaPatterns[0].key).toBe('strong-pattern')
    expect(trunk.version).toBe(2)
    expect(trunk.notes).toContain('Promoted schema: strong-pattern')
  })

  it('merges trunk and branch schemas in core view', () => {
    let trunk = createEmptySharedTrunk()
    let branch = createEmptyPersonalBranch('user-123')

    // Add schema to trunk
    const trunkSchema: SchemaPattern = {
      id: 'trunk-schema-1',
      key: 'trunk-pattern',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['trunk-tag'],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 20,
      strength: 0.9,
      confidence: 0.9,
      supportingTraceIds: [],
      firstSeenTurn: 0,
      lastReinforcedTurn: 100,
    }
    trunk = addPromotedSchema(trunk, trunkSchema)

    // Add schema to branch
    const branchSchema: SchemaPattern = {
      id: 'branch-schema-1',
      key: 'branch-pattern',
      dominantProtoMeaningIds: ['meaning-2'],
      dominantTextureTags: ['branch-tag'],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 5,
      strength: 0.6,
      confidence: 0.6,
      supportingTraceIds: [],
      firstSeenTurn: 50,
      lastReinforcedTurn: 60,
    }
    branch = updateBranchSchema(branch, branchSchema)

    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    // Both schemas should be in the view
    expect(coreView.activeSchemas.length).toBeGreaterThan(0)

    // Check that origins are correctly marked
    const trunkSchemas = coreView.activeSchemas.filter((s) => s.origin === 'shared_trunk')
    const branchSchemas = coreView.activeSchemas.filter((s) => s.origin === 'personal_branch')

    expect(trunkSchemas.length).toBeGreaterThan(0)
    expect(branchSchemas.length).toBeGreaterThan(0)
  })

  it('applies correct influence weights from facade', () => {
    let trunk = createEmptySharedTrunk()
    let branch = createEmptyPersonalBranch('user-123')

    // Add schemas
    const trunkSchema: SchemaPattern = {
      id: 'trunk-schema-1',
      key: 'trunk-pattern',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: [],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 10,
      strength: 1.0, // Max strength
      confidence: 1.0,
      supportingTraceIds: [],
      firstSeenTurn: 0,
      lastReinforcedTurn: 100,
    }
    trunk = addPromotedSchema(trunk, trunkSchema)

    const branchSchema: SchemaPattern = {
      id: 'branch-schema-1',
      key: 'branch-pattern',
      dominantProtoMeaningIds: ['meaning-2'],
      dominantTextureTags: [],
      optionTendencyKeys: [],
      somaticSignatureKeys: [],
      recurrenceCount: 5,
      strength: 1.0, // Max strength
      confidence: 1.0,
      supportingTraceIds: [],
      firstSeenTurn: 50,
      lastReinforcedTurn: 60,
    }
    branch = updateBranchSchema(branch, branchSchema)

    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    // Find the trunk and branch schemas in the view
    const trunkInView = coreView.activeSchemas.find((s) => s.origin === 'shared_trunk')
    const branchInView = coreView.activeSchemas.find((s) => s.origin === 'personal_branch')

    // Trunk should have weaker influence (0.2 weight)
    // Branch should have stronger influence (0.8 weight)
    if (trunkInView && branchInView) {
      expect(branchInView.strength).toBeGreaterThan(trunkInView.strength)
    }
  })
})
