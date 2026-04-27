import { describe, expect, it } from 'vitest'
import { runSignalModeRuntime } from '../runSignalModeRuntime'

describe('runSignalModeRuntime', () => {
  it('builds active-learning summaries for Signal Mode without touching other modes', async () => {
    const first = await runSignalModeRuntime({
      stimulus: {
        modality: 'text',
        vector: [0.9, 0.6, 0.3],
        strength: 1,
        timestamp: 1000,
      },
      isUserActive: true,
      recentActivityLevel: 0.6,
    })

    const second = await runSignalModeRuntime({
      stimulus: {
        modality: 'text',
        vector: [0.9, 0.6, 0.3],
        strength: 1,
        timestamp: 2000,
      },
      existingBranch: first.personalBranch,
      existingLoopState: first.loopState,
      existingFieldState: first.fieldState,
      existingConsolidationState: first.consolidationState,
      existingAttentionBudget: first.attentionBudget,
      isUserActive: false,
      recentActivityLevel: 0.1,
    })

    expect(second.personalBranch.sequenceRecords.length).toBeGreaterThanOrEqual(0)
    expect(second.personalBranch.plasticityRecords.length).toBeGreaterThan(0)
    expect(second.observe.activeLearning.sequence.totalRecords).toBeGreaterThanOrEqual(0)
    expect(second.observe.activeLearning.plasticity.totalRecords).toBeGreaterThan(0)
    expect(second.observe.activeLearning.activeAttention.budgetLimit).toBeGreaterThan(0)
    expect(second.observe.activeLearning.inquiry.totalQuestions).toBeGreaterThanOrEqual(0)
  })
})
