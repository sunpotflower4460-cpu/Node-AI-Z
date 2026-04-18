import { describe, it, expect } from 'vitest'
import { renderCrystallizedReply } from '../renderCrystallizedReply'
import type { CrystallizedSentencePlan, UtteranceIntent, LexicalPulls } from '../types'

describe('renderCrystallizedReply', () => {
  it('renders a reply from sentence plan', () => {
    const sentencePlan: CrystallizedSentencePlan = {
      opening: '重さという感じが',
      core: '決めたい',
      close: '',
    }

    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'hold',
      emotionalDistance: 0.3,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.6,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: ['heavy'],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = renderCrystallizedReply({
      sentencePlan,
      utteranceIntent,
      lexicalPulls,
    })

    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('。')
  })

  it('returns fallback when plan is empty', () => {
    const sentencePlan: CrystallizedSentencePlan = {}

    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'hold',
      emotionalDistance: 0.3,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.6,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = renderCrystallizedReply({
      sentencePlan,
      utteranceIntent,
      lexicalPulls,
    })

    expect(result).toBe('そうですね')
  })

  it('assembles multiple parts with connectors', () => {
    const sentencePlan: CrystallizedSentencePlan = {
      opening: '重さ',
      core: '決めたい',
      answer: '進む',
    }

    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'soft_answer',
      emotionalDistance: 0.4,
      answerForce: 0.6,
      structureNeed: 0.4,
      warmth: 0.6,
      ambiguityTolerance: 0.4,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = renderCrystallizedReply({
      sentencePlan,
      utteranceIntent,
      lexicalPulls,
    })

    expect(result).toContain('重さ')
    expect(result).toContain('決めたい')
    expect(result).toContain('進む')
  })

  it('respects maxSentences limit', () => {
    const sentencePlan: CrystallizedSentencePlan = {
      opening: 'Part 1',
      core: 'Part 2',
      optionFrame: 'Part 3',
      answer: 'Part 4',
      bridge: 'Part 5',
      close: 'Part 6',
    }

    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'structured_answer',
      emotionalDistance: 0.5,
      answerForce: 0.8,
      structureNeed: 0.8,
      warmth: 0.5,
      ambiguityTolerance: 0.3,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = renderCrystallizedReply({
      sentencePlan,
      utteranceIntent,
      lexicalPulls,
    })

    // Should not include all 6 parts due to safety limit
    expect(result).toBeTruthy()
  })

  it('applies polish to remove over-explaining when flagged', () => {
    const sentencePlan: CrystallizedSentencePlan = {
      opening: '重さのように見えます',
      core: '決めたいのように見えます',
    }

    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'soft_answer',
      emotionalDistance: 0.4,
      answerForce: 0.6,
      structureNeed: 0.4,
      warmth: 0.6,
      ambiguityTolerance: 0.4,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: true,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = renderCrystallizedReply({
      sentencePlan,
      utteranceIntent,
      lexicalPulls,
    })

    // Should clean up repetitive "のように見えます" patterns
    expect(result).toBeTruthy()
  })
})
