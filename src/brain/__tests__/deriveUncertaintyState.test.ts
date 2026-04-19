/**
 * Tests for deriveUncertaintyState
 */

import { describe, it, expect } from 'vitest'
import { deriveUncertaintyState } from '../deriveUncertaintyState'
import type { PredictionModulationResult } from '../../predictive/types'
import type { ProtoMeaning } from '../../meaning/types'
import type { OptionAwareness } from '../../option/types'

describe('deriveUncertaintyState', () => {
  it('should derive high novelty from high surprise', () => {
    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [
        { featureId: 'f1', expected: 0, actual: 0.8, error: 0.8, type: 'unexpected_present' },
        { featureId: 'f2', expected: 0, actual: 0.7, error: 0.7, type: 'unexpected_present' },
      ],
      overallSurprise: 0.9,
      fieldIntensityBoost: 0.5,
      debugNotes: [],
    }

    const result = deriveUncertaintyState({
      predictionModulation,
      sensoryMeanings: [],
      narrativeMeanings: [],
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.2,
    })

    expect(result.novelty).toBeGreaterThan(0.7)
    expect(result.expectedness).toBeLessThan(0.3)
  })

  it('should derive high ambiguity from weak meanings', () => {
    const weakMeanings: ProtoMeaning[] = [
      { id: 'm1', label: 'meaning1', strength: 0.2, source: 'sensory' },
      { id: 'm2', label: 'meaning2', strength: 0.25, source: 'sensory' },
      { id: 'm3', label: 'meaning3', strength: 0.18, source: 'narrative' },
    ]

    const result = deriveUncertaintyState({
      sensoryMeanings: weakMeanings.slice(0, 2),
      narrativeMeanings: weakMeanings.slice(2),
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.5,
    })

    expect(result.ambiguity).toBeGreaterThan(0.3)
    expect(result.confidenceDrift).toBeGreaterThan(0.5)
  })

  it('should derive high ambiguity from option hesitation', () => {
    const optionAwareness: OptionAwareness = {
      optionRatios: { observe: 0.48, lean: 0.52 },
      dominantOptionId: 'lean',
      differenceMagnitude: 0.04, // Very close
      hesitationStrength: 0.8,
      bridgeOptionPossible: true,
      confidence: 0.3,
      summaryLabel: 'hesitant',
    }

    const result = deriveUncertaintyState({
      sensoryMeanings: [],
      narrativeMeanings: [],
      optionAwareness,
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.5,
    })

    expect(result.ambiguity).toBeGreaterThan(0.6)
  })

  it('should derive high volatility from field intensity jump', () => {
    const result = deriveUncertaintyState({
      predictionModulation: {
        features: [],
        surpriseSignals: [],
        errors: [],
        overallSurprise: 0.5,
        fieldIntensityBoost: 0.9,
        debugNotes: [],
      },
      sensoryMeanings: [],
      narrativeMeanings: [],
      previousMicroSignal: { fieldTone: 'neutral', activeCueCount: 5, fusedConfidence: 0.7 },
      recentFieldIntensity: 0.2, // Big jump from 0.2 to 0.9
    })

    expect(result.volatilityEstimate).toBeGreaterThan(0.4)
  })

  it('should boost ambiguity for explicit questions', () => {
    const withoutQuestion = deriveUncertaintyState({
      sensoryMeanings: [],
      narrativeMeanings: [],
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.5,
      hasExplicitQuestion: false,
    })

    const withQuestion = deriveUncertaintyState({
      sensoryMeanings: [],
      narrativeMeanings: [],
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.5,
      hasExplicitQuestion: true,
    })

    expect(withQuestion.ambiguity).toBeGreaterThan(withoutQuestion.ambiguity)
  })

  it('should derive low novelty and high expectedness from expected input', () => {
    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [
        { featureId: 'f1', expected: 0.8, actual: 0.75, error: 0.05, type: 'correct' },
        { featureId: 'f2', expected: 0.6, actual: 0.62, error: 0.02, type: 'correct' },
      ],
      overallSurprise: 0.1,
      fieldIntensityBoost: 0.2,
      debugNotes: [],
    }

    const result = deriveUncertaintyState({
      predictionModulation,
      sensoryMeanings: [],
      narrativeMeanings: [],
      previousMicroSignal: undefined,
      recentFieldIntensity: 0.5,
    })

    expect(result.novelty).toBeLessThan(0.3)
    expect(result.expectedness).toBeGreaterThan(0.7)
  })
})
