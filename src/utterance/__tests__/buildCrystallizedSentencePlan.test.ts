import { describe, it, expect } from 'vitest'
import { buildCrystallizedSentencePlan } from '../buildCrystallizedSentencePlan'
import type { UtteranceIntent, UtteranceShape, LexicalPulls } from '../types'

describe('buildCrystallizedSentencePlan', () => {
  it('builds opening from texture when openWith is texture', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'hold',
      emotionalDistance: 0.3,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.6,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'texture',
      includeContrast: false,
      includeOptionBalance: false,
      includeBridge: false,
      includeQuestionBack: false,
      maxSentences: 3,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: ['heavy', 'fragile'],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const sensoryProtoMeanings = [
      {
        id: 's1',
        level: 'sensory' as const,
        glossJa: '重さ',
        strength: 0.7,
        sourceCueIds: [],
      },
    ]

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings,
      narrativeProtoMeanings: [],
    })

    expect(result.opening).toBeDefined()
    expect(result.opening).toContain('重さ')
  })

  it('builds opening from meaning when openWith is meaning', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'soft_answer',
      emotionalDistance: 0.4,
      answerForce: 0.6,
      structureNeed: 0.4,
      warmth: 0.6,
      ambiguityTolerance: 0.4,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'meaning',
      includeContrast: false,
      includeOptionBalance: false,
      includeBridge: false,
      includeQuestionBack: false,
      maxSentences: 3,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: ['決めたい'],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.opening).toBe('決めたい')
  })

  it('builds option frame when includeOptionBalance is true', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'option_compare',
      emotionalDistance: 0.5,
      answerForce: 0.4,
      structureNeed: 0.6,
      warmth: 0.5,
      ambiguityTolerance: 0.6,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'option',
      includeContrast: false,
      includeOptionBalance: true,
      includeBridge: false,
      includeQuestionBack: false,
      maxSentences: 4,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: ['どちらも'],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const optionAwareness = {
      optionRatios: { opt1: 0.5, opt2: 0.5 },
      differenceMagnitude: 0.1,
      hesitationStrength: 0.7,
      bridgeOptionPossible: false,
      confidence: 0.6,
      summaryLabel: 'balanced',
    }

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      optionAwareness,
    })

    expect(result.optionFrame).toBeDefined()
  })

  it('builds bridge when includeBridge is true', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'bridge_suggest',
      emotionalDistance: 0.5,
      answerForce: 0.5,
      structureNeed: 0.5,
      warmth: 0.6,
      ambiguityTolerance: 0.5,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'option',
      includeContrast: false,
      includeOptionBalance: true,
      includeBridge: true,
      includeQuestionBack: false,
      maxSentences: 4,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: ['橋渡し', '間'],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const optionAwareness = {
      optionRatios: { opt1: 0.5, opt2: 0.5 },
      differenceMagnitude: 0.2,
      hesitationStrength: 0.5,
      bridgeOptionPossible: true,
      confidence: 0.6,
      summaryLabel: 'bridge possible',
    }

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      optionAwareness,
    })

    expect(result.bridge).toBeDefined()
  })

  it('builds answer when answerForce is high', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'structured_answer',
      emotionalDistance: 0.5,
      answerForce: 0.8,
      structureNeed: 0.8,
      warmth: 0.5,
      ambiguityTolerance: 0.3,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'direct_answer',
      includeContrast: false,
      includeOptionBalance: false,
      includeBridge: false,
      includeQuestionBack: false,
      maxSentences: 5,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: ['決める'],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const narrativeProtoMeanings = [
      {
        id: 'n1',
        level: 'narrative' as const,
        glossJa: '決める',
        strength: 0.8,
        sourceCueIds: [],
      },
    ]

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings,
    })

    expect(result.answer).toBeDefined()
  })

  it('builds question close when includeQuestionBack is true', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'gentle_probe',
      emotionalDistance: 0.4,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.8,
    }

    const utteranceShape: UtteranceShape = {
      openWith: 'question',
      includeContrast: false,
      includeOptionBalance: false,
      includeBridge: false,
      includeQuestionBack: true,
      maxSentences: 3,
    }

    const lexicalPulls: LexicalPulls = {
      preferredTextures: [],
      preferredMeaningPhrases: [],
      preferredOptionPhrases: [],
      avoidOverexplaining: false,
      avoidFlatSummary: false,
      avoidTherapyTone: false,
    }

    const result = buildCrystallizedSentencePlan({
      utteranceIntent,
      utteranceShape,
      lexicalPulls,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.close).toBeDefined()
  })
})
