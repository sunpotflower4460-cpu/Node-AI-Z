import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTrunkSafetyState } from '../../core'
import { clearSharedTrunkState } from '../../core/sharedTrunk'

const mockState = {
  savedTrunk: undefined as Record<string, unknown> | undefined,
}

vi.mock('../../core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../core')>()
  const candidate = {
    id: 'candidate-ledger',
    type: 'schema' as const,
    sourceData: {
      id: 'schema-1',
      key: 'calm-bridge',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['calm'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['steady'],
      recurrenceCount: 3,
      strength: 0.6,
      confidence: 0.7,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 2,
    },
    score: 0.92,
    reasons: ['stable'],
    firstIdentifiedAt: 1,
    reinforcementCount: 4,
    approved: false,
    rejected: false,
  }

  return {
    ...actual,
    derivePromotionCandidates: () => [candidate],
    resolveGuardianMode: () => 'system_only' as const,
    buildGuardianReviewRequest: () => ({
      id: 'guardian-request-ledger',
      candidate,
      validation: {
        candidateId: candidate.id,
        status: 'approved' as const,
        riskLevel: 'low' as const,
        confidenceScore: 0.9,
        reasons: ['stable'],
        cautionNotes: [],
      },
      requestedAt: 1,
      guardianMode: 'system_only' as const,
      summary: ['stable'],
      cautionNotes: [],
    }),
    validatePromotionCandidate: () => ({
      candidateId: candidate.id,
      status: 'approved' as const,
      riskLevel: 'low' as const,
      confidenceScore: 0.9,
      reasons: ['stable'],
      cautionNotes: [],
    }),
    resolveGuardianReview: async () => ({
      requestId: 'guardian-request-ledger',
      actor: 'system' as const,
      decision: 'approve' as const,
      confidence: 0.9,
      reasons: ['stable'],
      cautionNotes: [],
      createdAt: 1,
    }),
    saveSharedTrunkState: (trunk: Record<string, unknown>) => {
      mockState.savedTrunk = trunk
    },
    loadSharedTrunkState: () => undefined,
  }
})

describe('runCrystallizedThinkingRuntime shared trunk apply ledger', () => {
  beforeEach(() => {
    clearTrunkSafetyState()
    clearSharedTrunkState()
    mockState.savedTrunk = undefined
  })

  it('records apply ledger entries and diff summary on approved trunk apply', async () => {
    const { runCrystallizedThinkingRuntime } = await import('../runCrystallizedThinkingRuntime')
    const { createPersonalLearningState } = await import('../../learning/personalLearning')

    const result = await runCrystallizedThinkingRuntime({
      text: 'apply shared trunk candidate',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.updatedTrunk?.trunkApplyRecords?.length).toBeGreaterThan(0)
    expect(result.updatedTrunk?.trunkApplyRecords?.[0]?.trunkDiffSummary.length).toBeGreaterThan(0)
    expect(result.updatedTrunk?.trunkSnapshotRecords?.length).toBeGreaterThanOrEqual(2)
    expect(mockState.savedTrunk).toBeDefined()
  })
})
