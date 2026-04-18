import { describe, it, expect } from 'vitest'
import { runCrystallizedThinkingRuntime } from '../runCrystallizedThinkingRuntime'
import type { PersonalLearningState } from '../../learning/types'

describe('runCrystallizedThinkingRuntime - utterance layer', () => {
  const mockPersonalLearning: PersonalLearningState = {
    somaticMarkers: [],
    pathwayWeights: {},
    lastUpdated: Date.now(),
  }

  it('generates utterance intent from internal state', () => {
    const result = runCrystallizedThinkingRuntime({
      text: '決めたいけど迷っている',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utteranceIntent).toBeDefined()
    expect(result.utteranceIntent?.primaryMove).toBeDefined()
    expect(result.utteranceIntent?.emotionalDistance).toBeGreaterThanOrEqual(0)
    expect(result.utteranceIntent?.emotionalDistance).toBeLessThanOrEqual(1)
  })

  it('generates utterance shape from intent', () => {
    const result = runCrystallizedThinkingRuntime({
      text: '重い気持ち',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utteranceShape).toBeDefined()
    expect(result.utteranceShape?.openWith).toBeDefined()
    expect(result.utteranceShape?.maxSentences).toBeGreaterThan(0)
  })

  it('generates lexical pulls from internal state', () => {
    const result = runCrystallizedThinkingRuntime({
      text: 'どちらか選びたい',
      personalLearning: mockPersonalLearning,
    })

    expect(result.lexicalPulls).toBeDefined()
    expect(result.lexicalPulls?.preferredTextures).toBeDefined()
    expect(result.lexicalPulls?.preferredMeaningPhrases).toBeDefined()
  })

  it('generates crystallized sentence plan', () => {
    const result = runCrystallizedThinkingRuntime({
      text: '何か決めないと',
      personalLearning: mockPersonalLearning,
    })

    expect(result.crystallizedSentencePlan).toBeDefined()
  })

  it('generates final crystallized reply', () => {
    const result = runCrystallizedThinkingRuntime({
      text: 'どうしよう',
      personalLearning: mockPersonalLearning,
    })

    expect(result.finalCrystallizedReply).toBeDefined()
    expect(result.finalCrystallizedReply).toBeTruthy()
    expect(typeof result.finalCrystallizedReply).toBe('string')
    expect(result.finalCrystallizedReply!.length).toBeGreaterThan(0)
  })

  it('keeps previous utterance for comparison', () => {
    const result = runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
    })

    expect(result.utterance).toBeDefined()
    // finalCrystallizedReply should be the new main output
    expect(result.finalCrystallizedReply).toBeDefined()
  })

  it('derives option_compare intent when options are present', () => {
    const result = runCrystallizedThinkingRuntime({
      text: 'AとBどちらも良い',
      personalLearning: mockPersonalLearning,
    })

    // If option awareness is detected, intent should reflect it
    if (result.optionAwareness && result.optionAwareness.confidence > 0.4) {
      expect(result.utteranceIntent?.primaryMove).toMatch(/option_compare|bridge_suggest|soft_answer/)
    }
  })

  it('generates complete utterance pipeline', () => {
    const result = runCrystallizedThinkingRuntime({
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
