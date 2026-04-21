import { describe, it, expect } from 'vitest'
import { runCrystallizedThinkingRuntime } from '../runCrystallizedThinkingRuntime'
import { createPersonalLearningState } from '../../learning/personalLearning'

describe('runCrystallizedThinkingRuntime - utterance layer', () => {
  const mockPersonalLearning = createPersonalLearningState()

  it('generates utterance intent from internal state', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '決めたいけど迷っている',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utteranceIntent).toBeDefined()
    expect(result.utteranceIntent?.primaryMove).toBeDefined()
    expect(result.utteranceIntent?.emotionalDistance).toBeGreaterThanOrEqual(0)
    expect(result.utteranceIntent?.emotionalDistance).toBeLessThanOrEqual(1)
  })

  it('generates utterance shape from intent', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '重い気持ち',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utteranceShape).toBeDefined()
    expect(result.utteranceShape?.openWith).toBeDefined()
    expect(result.utteranceShape?.maxSentences).toBeGreaterThan(0)
  })

  it('generates lexical pulls from internal state', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'どちらか選びたい',
      personalLearning: mockPersonalLearning,
    })

    expect(result.lexicalPulls).toBeDefined()
    expect(result.lexicalPulls?.preferredTextures).toBeDefined()
    expect(result.lexicalPulls?.preferredMeaningPhrases).toBeDefined()
  })

  it('generates crystallized sentence plan', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '何か決めないと',
      personalLearning: mockPersonalLearning,
    })

    expect(result.crystallizedSentencePlan).toBeDefined()
  })

  it('generates final crystallized reply', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'どうしよう',
      personalLearning: mockPersonalLearning,
    })

    expect(result.finalCrystallizedReply).toBeDefined()
    expect(result.finalCrystallizedReply).toBeTruthy()
    expect(typeof result.finalCrystallizedReply).toBe('string')
    expect(result.finalCrystallizedReply!.length).toBeGreaterThan(0)
  })

  it('keeps previous utterance for comparison', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utterance).toBeDefined()
    // finalCrystallizedReply should be the new main output
    expect(result.finalCrystallizedReply).toBeDefined()
  })

  it('derives option_compare intent when options are present', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'AとBどちらも良い',
      personalLearning: mockPersonalLearning,
    })

    // If option awareness is detected, intent should reflect it
    if (result.optionAwareness && result.optionAwareness.confidence > 0.4) {
      expect(result.utteranceIntent?.primaryMove).toMatch(/option_compare|bridge_suggest|soft_answer/)
    }
  })

  it('generates complete utterance pipeline', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '重くて決められない',
      personalLearning: mockPersonalLearning,
    })

    // Verify the complete pipeline
    expect(result.fusedState).toBeDefined()
    expect(result.protoMeanings).toBeDefined()
    expect(result.utteranceIntent).toBeDefined()
    expect(result.utteranceShape).toBeDefined()
    expect(result.lexicalPulls).toBeDefined()
    expect(result.crystallizedSentencePlan).toBeDefined()
    expect(result.finalCrystallizedReply).toBeDefined()
  })
})
