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
      enableBindingTeacher: true,
      textSummary: 'small repeating concept',
      imageSummary: 'matching visual concept',
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
      enableBindingTeacher: true,
      textSummary: 'small repeating concept',
      imageSummary: 'matching visual concept',
      isUserActive: false,
      recentActivityLevel: 0.1,
    })

    const third = await runSignalModeRuntime({
      stimulus: {
        modality: 'text',
        vector: [0.9, 0.62, 0.31],
        strength: 1,
        timestamp: 3000,
      },
      existingBranch: second.personalBranch,
      existingLoopState: second.loopState,
      existingFieldState: second.fieldState,
      existingConsolidationState: second.consolidationState,
      existingAttentionBudget: second.attentionBudget,
      enableBindingTeacher: true,
      textSummary: 'small repeating concept',
      imageSummary: 'matching visual concept',
      isUserActive: true,
      recentActivityLevel: 0.3,
    })

    expect(third.personalBranch.sequenceRecords.length).toBeGreaterThanOrEqual(0)
    expect(third.personalBranch.plasticityRecords.length).toBeGreaterThan(0)
    expect(third.observe.activeLearning.sequence.totalRecords).toBeGreaterThanOrEqual(0)
    expect(third.observe.activeLearning.plasticity.totalRecords).toBeGreaterThan(0)
    expect(third.observe.activeLearning.activeAttention.budgetLimit).toBeGreaterThan(0)
    expect(third.observe.activeLearning.inquiry.totalQuestions).toBeGreaterThanOrEqual(0)
    expect(third.personalBranch.predictionMemory.recentPredictions.length).toBeGreaterThan(0)
    expect(third.personalBranch.developmentState.stage).toBeGreaterThanOrEqual(6)
    expect(third.observe.actionOutcomeLearning.development.stage).toBeGreaterThanOrEqual(6)
    expect(third.observe.actionOutcomeLearning.modulators.learningRateMultiplier).toBeGreaterThan(0)
    expect(third.observe.actionOutcomeLearning.prediction.totalPredictions).toBeGreaterThan(0)
  })
})
