/**
 * Tests for applyPrecisionToPredictionError
 */

import { describe, it, expect } from 'vitest'
import { applyPrecisionToPredictionError } from '../applyPrecisionToPredictionError'
import type { PrecisionControl, UncertaintyState } from '../precisionTypes'
import type { PredictionModulationResult } from '../../predictive/types'

describe('applyPrecisionToPredictionError', () => {
  const basePrecision: PrecisionControl = {
    bottomUpWeight: 0.5,
    topDownWeight: 0.5,
    noveltyBoost: 0.0,
    learningRate: 1.0,
    inhibitionGain: 1.0,
    uncertaintyBias: 0.5,
    safetyBias: 0.5,
  }

  const baseUncertainty: UncertaintyState = {
    expectedness: 0.5,
    novelty: 0.5,
    ambiguity: 0.5,
    volatilityEstimate: 0.5,
    confidenceDrift: 0.5,
  }

  it('should preserve raw prediction error while computing effective error', () => {
    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [
        { featureId: 'f1', magnitude: 0.8, direction: 'unexpected_present' },
      ],
      errors: [],
      overallSurprise: 0.8,
      fieldIntensityBoost: 0.5,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      basePrecision,
      baseUncertainty
    )

    expect(result.rawPredictionError).toBe(0.8)
    expect(result.effectivePredictionError).toBeGreaterThan(0)
    expect(result.rawSurpriseSignals).toHaveLength(1)
  })

  it('should amplify error with high bottom-up weight', () => {
    const highBottomUpPrecision: PrecisionControl = {
      ...basePrecision,
      bottomUpWeight: 0.9,
      topDownWeight: 0.2,
    }

    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      highBottomUpPrecision,
      baseUncertainty
    )

    expect(result.effectivePredictionError).toBeGreaterThan(result.rawPredictionError * 0.8)
  })

  it('should dampen error with high top-down weight', () => {
    const highTopDownPrecision: PrecisionControl = {
      ...basePrecision,
      bottomUpWeight: 0.2,
      topDownWeight: 0.9,
    }

    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      highTopDownPrecision,
      baseUncertainty
    )

    expect(result.effectivePredictionError).toBeLessThan(result.rawPredictionError * 0.8)
  })

  it('should apply novelty boost to unexpected signals', () => {
    const noveltyBoostPrecision: PrecisionControl = {
      ...basePrecision,
      noveltyBoost: 0.8,
    }

    const highNoveltyUncertainty: UncertaintyState = {
      ...baseUncertainty,
      novelty: 0.9,
    }

    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [
        { featureId: 'f1', magnitude: 0.5, direction: 'unexpected_present' },
      ],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      noveltyBoostPrecision,
      highNoveltyUncertainty
    )

    expect(result.weightedSurprise).toBeGreaterThan(result.rawPredictionError)
  })

  it('should dampen error with high safety bias', () => {
    const safePrecision: PrecisionControl = {
      ...basePrecision,
      safetyBias: 0.9,
    }

    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      safePrecision,
      baseUncertainty
    )

    expect(result.effectivePredictionError).toBeLessThan(result.rawPredictionError)
  })

  it('should handle undefined prediction modulation', () => {
    const result = applyPrecisionToPredictionError(
      undefined,
      basePrecision,
      baseUncertainty
    )

    expect(result.rawPredictionError).toBe(0)
    expect(result.effectivePredictionError).toBe(0)
    expect(result.rawSurpriseSignals).toHaveLength(0)
    expect(result.weightedSurpriseSignals).toHaveLength(0)
  })

  it('should provide explanatory notes', () => {
    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      basePrecision,
      baseUncertainty
    )

    expect(result.notes.length).toBeGreaterThan(0)
    expect(result.notes[0]).toHaveProperty('target')
    expect(result.notes[0]).toHaveProperty('delta')
    expect(result.notes[0]).toHaveProperty('reason')
  })

  it('should weight individual surprise signals differently based on direction', () => {
    const noveltyBoostPrecision: PrecisionControl = {
      ...basePrecision,
      noveltyBoost: 0.5,
    }

    const predictionModulation: PredictionModulationResult = {
      features: [],
      surpriseSignals: [
        { featureId: 'f1', magnitude: 0.5, direction: 'unexpected_present' },
        { featureId: 'f2', magnitude: 0.5, direction: 'strength_higher' },
      ],
      errors: [],
      overallSurprise: 0.5,
      fieldIntensityBoost: 0.3,
      debugNotes: [],
    }

    const result = applyPrecisionToPredictionError(
      predictionModulation,
      noveltyBoostPrecision,
      baseUncertainty
    )

    expect(result.weightedSurpriseSignals).toHaveLength(2)
    // unexpected_present should get extra boost
    const unexpectedSignal = result.weightedSurpriseSignals.find(s => s.direction === 'unexpected_present')
    const higherSignal = result.weightedSurpriseSignals.find(s => s.direction === 'strength_higher')

    expect(unexpectedSignal?.magnitude).toBeGreaterThan(higherSignal?.magnitude ?? 0)
  })
})
