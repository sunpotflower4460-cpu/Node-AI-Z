import { describe, it, expect } from 'vitest'
import { deriveUtteranceIntent } from '../deriveUtteranceIntent'
import type { FusedState } from '../../fusion/types'
import type { ProtoMeaning } from '../../meaning/types'

describe('deriveUtteranceIntent', () => {
  it('derives hold intent when fragility is high and shouldAnswer is false', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['fragile', 'delicate'],
      fusedConfidence: 0.5,
    }

    const sensoryProtoMeanings: ProtoMeaning[] = []
    const narrativeProtoMeanings: ProtoMeaning[] = []

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings,
      narrativeProtoMeanings,
    })

    expect(result.primaryMove).toBe('hold')
    expect(result.emotionalDistance).toBeLessThan(0.5)
  })

  it('derives structured_answer intent when narrative clarity is high', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['clear'],
      fusedConfidence: 0.8,
    }

    const sensoryProtoMeanings: ProtoMeaning[] = []
    const narrativeProtoMeanings: ProtoMeaning[] = [
      {
        id: 'n1',
        level: 'narrative',
        glossJa: '決めたい',
        strength: 0.8,
        sourceCueIds: [],
      },
    ]

    const somaticInfluence = {
      matchedMarkerIds: [],
      averageOutcome: {
        naturalness: 0.5,
        safety: 0.5,
        helpfulness: 0.8,
        openness: 0.3,
      },
      influenceStrength: 0.6,
      debugNotes: [],
    }

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings,
      narrativeProtoMeanings,
      somaticInfluence,
    })

    expect(result.primaryMove).toBe('structured_answer')
    expect(result.answerForce).toBeGreaterThan(0.5)
  })

  it('derives option_compare intent when option awareness has ambivalence', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.6,
    }

    const sensoryProtoMeanings: ProtoMeaning[] = []
    const narrativeProtoMeanings: ProtoMeaning[] = []

    const optionAwareness = {
      optionRatios: { opt1: 0.5, opt2: 0.5 },
      differenceMagnitude: 0.1,
      hesitationStrength: 0.7,
      bridgeOptionPossible: false,
      confidence: 0.6,
      summaryLabel: 'ambivalent',
    }

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings,
      narrativeProtoMeanings,
      optionAwareness,
    })

    expect(result.primaryMove).toBe('option_compare')
  })

  it('derives bridge_suggest intent when stance is bridge', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.6,
    }

    const optionAwareness = {
      optionRatios: { opt1: 0.5, opt2: 0.5 },
      differenceMagnitude: 0.2,
      hesitationStrength: 0.5,
      bridgeOptionPossible: true,
      confidence: 0.6,
      summaryLabel: 'bridge possible',
    }

    const currentDecision = {
      stance: 'bridge' as const,
      shouldDefer: false,
      shouldOfferBridge: true,
      confidence: 0.7,
      notes: [],
    }

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      optionAwareness,
      currentDecision,
    })

    expect(result.primaryMove).toBe('bridge_suggest')
  })

  it('sets warmth higher when fragility is present', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['fragile'],
      fusedConfidence: 0.5,
    }

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.warmth).toBeGreaterThan(0.6)
  })

  it('sets ambiguityTolerance higher when shouldStayOpen is true', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.5,
    }

    const somaticInfluence = {
      matchedMarkerIds: [],
      averageOutcome: {
        naturalness: 0.5,
        safety: 0.5,
        helpfulness: 0.3,
        openness: 0.8,
      },
      influenceStrength: 0.6,
      debugNotes: [],
    }

    const result = deriveUtteranceIntent({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      somaticInfluence,
    })

    expect(result.ambiguityTolerance).toBeGreaterThan(0.6)
  })
})
