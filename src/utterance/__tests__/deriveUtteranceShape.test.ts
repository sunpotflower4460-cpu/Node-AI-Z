import { describe, it, expect } from 'vitest'
import { deriveUtteranceShape } from '../deriveUtteranceShape'
import type { UtteranceIntent } from '../types'

describe('deriveUtteranceShape', () => {
  it('opens with texture when primaryMove is hold', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'hold',
      emotionalDistance: 0.3,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.6,
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

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings,
      narrativeProtoMeanings: [],
    })

    expect(result.openWith).toBe('texture')
  })

  it('opens with option when primaryMove is option_compare', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'option_compare',
      emotionalDistance: 0.5,
      answerForce: 0.4,
      structureNeed: 0.6,
      warmth: 0.5,
      ambiguityTolerance: 0.6,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.openWith).toBe('option')
  })

  it('opens with question when primaryMove is gentle_probe', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'gentle_probe',
      emotionalDistance: 0.4,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.6,
      ambiguityTolerance: 0.8,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.openWith).toBe('question')
  })

  it('opens with direct_answer when structureNeed is high', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'structured_answer',
      emotionalDistance: 0.5,
      answerForce: 0.8,
      structureNeed: 0.8,
      warmth: 0.5,
      ambiguityTolerance: 0.3,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.openWith).toBe('direct_answer')
  })

  it('includes option balance when option awareness is strong', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'option_compare',
      emotionalDistance: 0.5,
      answerForce: 0.4,
      structureNeed: 0.6,
      warmth: 0.5,
      ambiguityTolerance: 0.6,
    }

    const optionAwareness = {
      optionRatios: { opt1: 0.5, opt2: 0.5 },
      differenceMagnitude: 0.2,
      hesitationStrength: 0.5,
      bridgeOptionPossible: false,
      confidence: 0.7,
      summaryLabel: 'balanced',
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      optionAwareness,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.includeOptionBalance).toBe(true)
  })

  it('includes bridge when primaryMove is bridge_suggest', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'bridge_suggest',
      emotionalDistance: 0.5,
      answerForce: 0.5,
      structureNeed: 0.5,
      warmth: 0.6,
      ambiguityTolerance: 0.5,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.includeBridge).toBe(true)
  })

  it('includes question back when ambiguityTolerance is high', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'reflect',
      emotionalDistance: 0.4,
      answerForce: 0.3,
      structureNeed: 0.3,
      warmth: 0.6,
      ambiguityTolerance: 0.8,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.includeQuestionBack).toBe(true)
  })

  it('sets maxSentences higher for structured_answer', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'structured_answer',
      emotionalDistance: 0.5,
      answerForce: 0.8,
      structureNeed: 0.8,
      warmth: 0.5,
      ambiguityTolerance: 0.3,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.maxSentences).toBeGreaterThanOrEqual(4)
  })

  it('sets maxSentences lower for hold', () => {
    const utteranceIntent: UtteranceIntent = {
      primaryMove: 'hold',
      emotionalDistance: 0.3,
      answerForce: 0.2,
      structureNeed: 0.3,
      warmth: 0.7,
      ambiguityTolerance: 0.6,
    }

    const result = deriveUtteranceShape({
      utteranceIntent,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.maxSentences).toBeLessThanOrEqual(3)
  })
})
