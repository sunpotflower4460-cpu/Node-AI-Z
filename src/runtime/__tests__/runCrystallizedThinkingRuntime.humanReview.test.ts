import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HumanReviewRecord, HumanReviewSummary } from '../../core/guardian/humanReview/humanReviewTypes'

const mockState = {
  promotionQueue: [] as Array<Record<string, unknown>>,
  guardianQueue: [] as Array<Record<string, unknown>>,
  humanSummaries: [] as HumanReviewSummary[],
  humanRecords: [] as HumanReviewRecord[],
}

vi.mock('../../core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../core')>()
  const mockCandidate = {
    id: 'candidate-hr',
    type: 'schema' as const,
    sourceData: {
      id: 'schema-hr',
      key: 'review-pattern',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['steady'],
      optionTendencyKeys: ['hold'],
      somaticSignatureKeys: ['grounded'],
      recurrenceCount: 5,
      strength: 0.82,
      confidence: 0.8,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 8,
    },
    score: 0.91,
    reasons: ['Stable pattern'],
    firstIdentifiedAt: 1,
    reinforcementCount: 5,
    approved: false,
    rejected: false,
  }

  const mockValidation = {
    candidateId: mockCandidate.id,
    status: 'approved' as const,
    riskLevel: 'high' as const,
    confidenceScore: 0.82,
    reasons: ['High value pattern'],
    cautionNotes: ['Needs human eyes'],
  }

  return {
    ...actual,
    derivePromotionCandidates: () => [mockCandidate],
    enqueuePromotionCandidate: (candidate: typeof mockCandidate) => {
      const entry = {
        id: `queue-${candidate.id}`,
        candidate,
        status: 'queued',
        createdAt: 1,
        updatedAt: 1,
      }
      mockState.promotionQueue = [entry]
      return entry
    },
    listPromotionQueue: () => mockState.promotionQueue,
    updatePromotionQueueEntry: (entryId: string, updates: Record<string, unknown>) => {
      mockState.promotionQueue = mockState.promotionQueue.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              ...updates,
            }
          : entry
      )

      return mockState.promotionQueue.find(entry => entry.id === entryId)
    },
    validatePromotionCandidate: () => mockValidation,
    resolveGuardianMode: () => 'human_required' as const,
    buildGuardianReviewRequest: () => ({
      id: 'guardian-req-hr',
      candidate: mockCandidate,
      validation: mockValidation,
      requestedAt: 1,
      guardianMode: 'human_required' as const,
      summary: ['Type: schema', 'High risk'],
      cautionNotes: mockValidation.cautionNotes,
    }),
    enqueueGuardianReview: (request: Record<string, unknown>) => {
      const entry = {
        id: 'guardian-queue-hr',
        request,
        status: 'queued',
        createdAt: 1,
        updatedAt: 1,
      }
      mockState.guardianQueue = [entry]
      return entry
    },
    resolveGuardianReview: async () => ({
      requestId: 'guardian-req-hr',
      actor: 'ai_sensei' as const,
      decision: 'quarantine' as const,
      confidence: 0.5,
      reasons: ['Holding for human review'],
      cautionNotes: ['Needs explicit approval'],
      createdAt: 1,
    }),
    guardianDecisionResolver: actual.guardianDecisionResolver,
    resolveGuardianReviewQueueEntry: (entryId: string, result: Record<string, unknown>) => {
      mockState.guardianQueue = mockState.guardianQueue.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              status: 'resolved',
              result,
            }
          : entry
      )

      return mockState.guardianQueue.find(entry => entry.id === entryId)
    },
    queueHumanReviewSummary: (summary: HumanReviewSummary) => {
      mockState.humanSummaries = [summary]
      return summary
    },
    getHumanReviewState: () => ({
      summaries: mockState.humanSummaries,
      records: mockState.humanRecords,
    }),
    getPromotionQueueState: () => mockState.promotionQueue,
    getPromotionLogState: () => [],
    getGuardianReviewQueueState: () => mockState.guardianQueue,
    applyApprovedPromotion: (
      trunk: ReturnType<typeof actual.createEmptySharedTrunk>,
      candidate: typeof mockCandidate
    ) => ({
      success: true,
      candidateId: candidate.id,
      trunkUpdated: true,
      notes: ['applied'],
      nextTrunk: {
        ...trunk,
        notes: [...trunk.notes, 'applied'],
      },
    }),
    logCandidateQueued: () => {},
    logValidationFinished: () => {},
    logCandidateQuarantined: () => {},
    logCandidateRejected: () => {},
    logCandidateApproved: () => {},
    logCandidateApplied: () => {},
    getAiSenseiConfig: () => ({ mode: 'mock', timeoutMs: 10 }),
    getGuardianPolicy: actual.getGuardianPolicy,
  }
})

beforeEach(() => {
  mockState.promotionQueue = []
  mockState.guardianQueue = []
  mockState.humanSummaries = []
  mockState.humanRecords = []
})

describe('runCrystallizedThinkingRuntime - human review flow', () => {
  it('queues human_required candidates as pending human reviews', async () => {
    const { runCrystallizedThinkingRuntime } = await import('../runCrystallizedThinkingRuntime')
    const { createPersonalLearningState } = await import('../../learning/personalLearning')

    const result = await runCrystallizedThinkingRuntime({
      text: 'steady pattern candidate',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.humanReviewSummaries?.length).toBe(1)
    expect(result.humanReviewSummaries?.[0]?.summary.some((line) => line.includes('Consistency Score'))).toBe(true)
    expect(result.guardianReviewResults?.length ?? 0).toBe(0)
    expect(result.updatedTrunk?.promotionQueue?.[0]?.status).toBe('quarantined')
    expect(result.updatedTrunk?.guardianReviewQueue?.[0]?.status).toBe('queued')
  })

  it('applies human reviewer approval before trunk apply', async () => {
    const now = Date.now()
    mockState.humanRecords = [
      {
        id: 'record-hr',
        candidateId: 'candidate-hr',
        actor: 'human_reviewer' as const,
        decision: 'approve' as const,
        reason: 'safe to promote',
        createdAt: now,
      },
    ]
    const { runCrystallizedThinkingRuntime } = await import('../runCrystallizedThinkingRuntime')
    const { createPersonalLearningState } = await import('../../learning/personalLearning')

    const result = await runCrystallizedThinkingRuntime({
      text: 'apply after human decision',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.guardianReviewResults?.[0]?.decision).toBe('approve')
    expect(result.updatedTrunk?.promotionQueue?.[0]?.status).toBe('applied')
    expect(result.updatedTrunk?.humanReviewRecords?.[0]?.decision).toBe('approve')
  })
})
