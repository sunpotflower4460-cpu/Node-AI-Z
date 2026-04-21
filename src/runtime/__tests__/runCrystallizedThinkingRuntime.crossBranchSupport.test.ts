import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTrunkSafetyState } from '../../core'
import { clearSharedTrunkState } from '../../core/sharedTrunk'

const savedState = {
  trunk: undefined as Record<string, unknown> | undefined,
}

vi.mock('../../core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../core')>()
  const candidate = {
    id: 'candidate-cross',
    type: 'schema' as const,
    sourceData: {
      id: 'schema-cross',
      key: 'shared-bridge',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['steady'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['grounded'],
      recurrenceCount: 8,
      strength: 0.9,
      confidence: 0.88,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 8,
    },
    score: 0.94,
    reasons: ['stable', 'repeated'],
    firstIdentifiedAt: Date.now() - 1000 * 60 * 60 * 4,
    reinforcementCount: 8,
    approved: false,
    rejected: false,
  }

  return {
    ...actual,
    derivePromotionCandidates: () => [candidate],
    loadSharedTrunkState: () => ({
      ...actual.createEmptySharedTrunk(),
      comparableBranchSummaries: [
        {
          branchId: 'default-user',
          schemaKeys: ['old-self-pattern'],
          mixedPatternKeys: [],
          optionTendencyKeys: [],
          metaphorKeys: [],
          updatedAt: 1,
        },
        {
          branchId: 'branch-a',
          schemaKeys: ['shared-bridge'],
          mixedPatternKeys: [],
          optionTendencyKeys: ['bridge'],
          metaphorKeys: ['steady'],
          updatedAt: 1,
        },
        {
          branchId: 'branch-b',
          schemaKeys: ['shared-bridge'],
          mixedPatternKeys: [],
          optionTendencyKeys: ['bridge'],
          metaphorKeys: ['steady'],
          updatedAt: 1,
        },
      ],
    }),
    saveSharedTrunkState: (trunk: Record<string, unknown>) => {
      savedState.trunk = trunk
    },
  }
})

describe('runCrystallizedThinkingRuntime cross-branch support', () => {
  beforeEach(() => {
    clearTrunkSafetyState()
    clearSharedTrunkState()
    savedState.trunk = undefined
  })

  it('attaches consistency support, persists branch summaries, and records support in trunk state', async () => {
    const { runCrystallizedThinkingRuntime } = await import('../runCrystallizedThinkingRuntime')
    const { createPersonalLearningState } = await import('../../learning/personalLearning')

    const result = await runCrystallizedThinkingRuntime({
      text: 'cross branch support candidate',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.promotionCandidates?.[0]?.crossBranchSupport?.supportCount).toBe(2)
    expect(result.promotionCandidates?.[0]?.crossBranchSupport?.comparedBranchCount).toBe(2)
    expect(result.promotionCandidates?.[0]?.crossBranchSupport?.matches?.length).toBe(2)
    expect(result.guardianReviewRequests?.[0]?.summary.some((line) => line.includes('Cross-branch support'))).toBe(true)
    expect(result.updatedTrunk?.promotionConsistencyRecords?.length).toBeGreaterThan(0)
    expect(result.updatedTrunk?.comparableBranchSummaries?.some((summary) => summary.branchId === 'default-user')).toBe(true)
    expect(savedState.trunk).toBeDefined()
  })
})
