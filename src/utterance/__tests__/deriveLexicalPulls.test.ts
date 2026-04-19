import { describe, it, expect } from 'vitest'
import { deriveLexicalPulls } from '../deriveLexicalPulls'
import type { FusedState } from '../../fusion/types'

describe('deriveLexicalPulls', () => {
  it('pulls preferred textures from fusedState', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['heavy', 'fragile', 'searching'],
      fusedConfidence: 0.6,
    }

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
    })

    expect(result.preferredTextures).toContain('heavy')
    expect(result.preferredTextures).toContain('fragile')
  })

  it('pulls preferred meaning phrases from narrative proto meanings', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.6,
    }

    const narrativeProtoMeanings = [
      {
        id: 'n1',
        level: 'narrative' as const,
        glossJa: '決めたい',
        strength: 0.7,
        sourceCueIds: [],
      },
      {
        id: 'n2',
        level: 'narrative' as const,
        glossJa: '迷っている',
        strength: 0.5,
        sourceCueIds: [],
      },
    ]

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings,
    })

    expect(result.preferredMeaningPhrases).toContain('決めたい')
    expect(result.preferredMeaningPhrases).toContain('迷っている')
  })

  it('includes option phrases when option awareness has hesitation', () => {
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
      hesitationStrength: 0.7,
      bridgeOptionPossible: false,
      confidence: 0.6,
      summaryLabel: 'hesitant',
    }

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      optionAwareness,
    })

    expect(result.preferredOptionPhrases.length).toBeGreaterThan(0)
  })

  it('sets avoidOverexplaining true when narrative strength is high', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.6,
    }

    const narrativeProtoMeanings = [
      {
        id: 'n1',
        level: 'narrative' as const,
        glossJa: '決めたい',
        strength: 0.8,
        sourceCueIds: [],
      },
      {
        id: 'n2',
        level: 'narrative' as const,
        glossJa: '進みたい',
        strength: 0.7,
        sourceCueIds: [],
      },
    ]

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings,
    })

    expect(result.avoidOverexplaining).toBe(true)
  })

  it('sets avoidFlatSummary true when rich textures are present', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['heavy', 'fragile', 'searching'],
      fusedConfidence: 0.6,
    }

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings: [
        { id: 's1', level: 'sensory', glossJa: '重さ', strength: 0.6, sourceCueIds: [] },
        { id: 's2', level: 'sensory', glossJa: '揺れ', strength: 0.5, sourceCueIds: [] },
        { id: 's3', level: 'sensory', glossJa: '探し', strength: 0.4, sourceCueIds: [] },
      ],
      narrativeProtoMeanings: [],
    })

    expect(result.avoidFlatSummary).toBe(true)
  })

  it('sets avoidTherapyTone true when strong texture is present', () => {
    const fusedState: FusedState = {
      lexicalState: { cues: [], features: [] },
      microSignalState: { dimensions: [], timestamp: 0 },
      integratedTensions: [],
      dominantTextures: ['heavy'],
      fusedConfidence: 0.6,
    }

    const sensoryProtoMeanings = [
      {
        id: 's1',
        level: 'sensory' as const,
        glossJa: '重さ',
        strength: 0.9,
        sourceCueIds: [],
      },
    ]

    const result = deriveLexicalPulls({
      fusedState,
      sensoryProtoMeanings,
      narrativeProtoMeanings: [],
    })

    expect(result.avoidTherapyTone).toBe(true)
  })
})
