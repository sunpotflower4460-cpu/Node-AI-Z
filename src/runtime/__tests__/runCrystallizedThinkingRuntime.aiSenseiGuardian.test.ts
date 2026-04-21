import { describe, expect, it, vi } from 'vitest'

vi.mock('../../core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../core')>()
  const mockCandidate = {
    id: 'candidate-1',
    type: 'schema' as const,
    sourceData: {
      id: 'schema-1',
      key: 'cross-branch-pattern',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['steady'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['settled'],
      recurrenceCount: 6,
      strength: 0.8,
      confidence: 0.85,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 10,
    },
    score: 0.83,
    reasons: ['Recurring pattern'],
    firstIdentifiedAt: 1,
    reinforcementCount: 6,
    approved: false,
    rejected: false,
  }

  const mockValidation = {
    candidateId: 'candidate-1',
    status: 'approved' as const,
    riskLevel: 'medium' as const,
    confidenceScore: 0.81,
    reasons: ['Looks stable enough'],
    cautionNotes: ['Watch rollout'],
  }

  let promotionQueue: Array<Record<string, unknown>> = []
  let guardianQueue: Array<Record<string, unknown>> = []

  return {
    ...actual,
    getAiSenseiConfig: () => ({
      mode: 'mock' as const,
      timeoutMs: 100,
    }),
    derivePromotionCandidates: () => [mockCandidate],
    enqueuePromotionCandidate: (candidate: typeof mockCandidate) => {
      const entry = {
        id: `queue-${candidate.id}`,
        candidate,
        status: 'queued',
        createdAt: 1,
        updatedAt: 1,
      }
      promotionQueue = [entry]
      return entry
    },
    listPromotionQueue: () => promotionQueue,
    updatePromotionQueueEntry: (entryId: string, updates: Record<string, unknown>) => {
      promotionQueue = promotionQueue.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              ...updates,
            }
          : entry
      )

      return promotionQueue.find(entry => entry.id === entryId)
    },
    validatePromotionCandidate: () => mockValidation,
    resolveGuardianMode: () => 'guardian_assisted' as const,
    buildGuardianReviewRequest: () => ({
      id: 'guardian-req-1',
      candidate: mockCandidate,
      validation: mockValidation,
      requestedAt: 1,
      guardianMode: 'guardian_assisted' as const,
      summary: ['Type: schema', 'Risk level: medium'],
      cautionNotes: ['Watch rollout'],
    }),
    enqueueGuardianReview: (request: Record<string, unknown>) => {
      const entry = {
        id: 'guardian-queue-1',
        request,
        status: 'queued',
        createdAt: 1,
        updatedAt: 1,
      }
      guardianQueue = [entry]
      return entry
    },
    resolveGuardianReview: async () => ({
      requestId: 'guardian-req-1',
      actor: 'ai_sensei' as const,
      decision: 'approve' as const,
      confidence: 0.86,
      reasons: ['AI sensei approved'],
      cautionNotes: ['Watch rollout'],
      createdAt: 1,
      aiSensei: {
        mode: 'mock' as const,
        payload: {
          requestId: 'guardian-req-1',
          guardianMode: 'guardian_assisted' as const,
          candidateKind: 'schema',
          confidenceScore: 0.81,
          riskLevel: 'medium' as const,
          summary: ['Type: schema', 'Risk level: medium'],
          cautionNotes: ['Watch rollout'],
        },
        rawResponse: {
          decision: 'approve' as const,
          confidence: 0.86,
          reasons: ['AI sensei approved'],
          cautionNotes: ['Watch rollout'],
        },
        parsedReview: {
          success: true,
          decision: 'approve' as const,
          confidence: 0.86,
          reasons: ['AI sensei approved'],
          cautionNotes: ['Watch rollout'],
          parseNotes: [],
        },
        fallbackNotes: [],
      },
    }),
    guardianDecisionResolver: () => ({
      finalStatus: 'approved' as const,
      guardianDecision: 'approve' as const,
      guardianActor: 'ai_sensei' as const,
      reasons: ['AI sensei approved'],
    }),
    resolveGuardianReviewQueueEntry: (entryId: string, result: Record<string, unknown>) => {
      guardianQueue = guardianQueue.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              status: 'resolved',
              result,
            }
          : entry
      )

      return guardianQueue.find(entry => entry.id === entryId)
    },
    getPromotionQueueState: () => promotionQueue,
    getPromotionLogState: () => [],
    getGuardianReviewQueueState: () => guardianQueue,
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
  }
})

describe('runCrystallizedThinkingRuntime - AI sensei guardian lane', () => {
  it('records AI sensei review traces and final decisions for crystallized thinking promotions', async () => {
    const { runCrystallizedThinkingRuntime } = await import('../runCrystallizedThinkingRuntime')
    const { createPersonalLearningState } = await import('../../learning/personalLearning')

    const result = await runCrystallizedThinkingRuntime({
      text: 'ゆっくり繰り返し考えている',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.aiSenseiConfig?.mode).toBe('mock')
    expect(result.guardianReviewResults?.[0]?.aiSensei?.payload.requestId).toBe(
      'guardian-req-1'
    )
    expect(result.guardianReviewResults?.[0]?.finalDecision?.finalStatus).toBe(
      'approved'
    )
    expect(result.updatedTrunk?.guardianReviewQueue?.[0]?.result?.finalDecision?.finalStatus).toBe(
      'approved'
    )
  })
})
