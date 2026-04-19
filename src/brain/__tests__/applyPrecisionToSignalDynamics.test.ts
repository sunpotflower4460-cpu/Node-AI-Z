/**
 * Tests for applyPrecisionToSignalDynamics
 */

import { describe, it, expect } from 'vitest'
import { applyPrecisionToSignalDynamics } from '../applyPrecisionToSignalDynamics'
import type { PrecisionControl } from '../precisionTypes'
import type { PrecisionWeightedPredictionError } from '../applyPrecisionToPredictionError'

describe('applyPrecisionToSignalDynamics', () => {
  const basePrecision: PrecisionControl = {
    bottomUpWeight: 0.5,
    topDownWeight: 0.5,
    noveltyBoost: 0.0,
    learningRate: 1.0,
    inhibitionGain: 1.0,
    uncertaintyBias: 0.5,
    safetyBias: 0.5,
  }

  const baseWeightedError: PrecisionWeightedPredictionError = {
    rawPredictionError: 0.5,
    effectivePredictionError: 0.5,
    rawSurpriseSignals: [],
    weightedSurpriseSignals: [],
    weightedSurprise: 0.5,
    notes: [],
  }

  it('should amplify cue reinforcement with high bottom-up weight', () => {
    const highBottomUpPrecision: PrecisionControl = {
      ...basePrecision,
      bottomUpWeight: 0.8,
    }

    const result = applyPrecisionToSignalDynamics(
      highBottomUpPrecision,
      baseWeightedError
    )

    expect(result.cueReinforcementGain).toBeGreaterThan(1.0)
  })

  it('should amplify cue reinforcement with high effective error', () => {
    const highEffectiveError: PrecisionWeightedPredictionError = {
      ...baseWeightedError,
      effectivePredictionError: 0.8,
    }

    const result = applyPrecisionToSignalDynamics(
      basePrecision,
      highEffectiveError
    )

    expect(result.cueReinforcementGain).toBeGreaterThan(1.0)
  })

  it('should use inhibition gain from precision control', () => {
    const highInhibitionPrecision: PrecisionControl = {
      ...basePrecision,
      inhibitionGain: 1.5,
    }

    const result = applyPrecisionToSignalDynamics(
      highInhibitionPrecision,
      baseWeightedError
    )

    expect(result.inhibitionMultiplier).toBe(1.5)
  })

  it('should foreground new meanings with high learning rate and bottom-up', () => {
    const exploratoryPrecision: PrecisionControl = {
      ...basePrecision,
      learningRate: 0.9,
      bottomUpWeight: 0.7,
    }

    const result = applyPrecisionToSignalDynamics(
      exploratoryPrecision,
      baseWeightedError
    )

    expect(result.meaningForegroundGain).toBeGreaterThan(1.0)
  })

  it('should maintain existing meanings with high top-down weight', () => {
    const conservativePrecision: PrecisionControl = {
      ...basePrecision,
      topDownWeight: 0.8,
    }

    const result = applyPrecisionToSignalDynamics(
      conservativePrecision,
      baseWeightedError
    )

    expect(result.meaningForegroundGain).toBeLessThan(1.0)
  })

  it('should use learning rate from precision control for temporal learning', () => {
    const cautiousPrecision: PrecisionControl = {
      ...basePrecision,
      learningRate: 0.3,
    }

    const result = applyPrecisionToSignalDynamics(
      cautiousPrecision,
      baseWeightedError
    )

    // Temporal learning gain is clamped to 0.5-2.0 range
    expect(result.temporalLearningGain).toBe(0.5) // 0.3 clamped to 0.5
  })

  it('should clamp all multipliers to valid ranges', () => {
    const extremePrecision: PrecisionControl = {
      bottomUpWeight: 1.0,
      topDownWeight: 1.0,
      noveltyBoost: 1.0,
      learningRate: 0.0,
      inhibitionGain: 2.5, // Will be clamped
      uncertaintyBias: 1.0,
      safetyBias: 1.0,
    }

    const extremeError: PrecisionWeightedPredictionError = {
      ...baseWeightedError,
      effectivePredictionError: 1.0,
    }

    const result = applyPrecisionToSignalDynamics(
      extremePrecision,
      extremeError
    )

    expect(result.cueReinforcementGain).toBeLessThanOrEqual(2.0)
    expect(result.cueReinforcementGain).toBeGreaterThanOrEqual(0.5)
    expect(result.inhibitionMultiplier).toBeLessThanOrEqual(2.0)
    expect(result.inhibitionMultiplier).toBeGreaterThanOrEqual(0.5)
    expect(result.meaningForegroundGain).toBeLessThanOrEqual(1.5)
    expect(result.meaningForegroundGain).toBeGreaterThanOrEqual(0.5)
    expect(result.temporalLearningGain).toBeLessThanOrEqual(2.0)
    expect(result.temporalLearningGain).toBeGreaterThanOrEqual(0.5)
  })

  it('should provide explanatory notes', () => {
    const result = applyPrecisionToSignalDynamics(
      basePrecision,
      baseWeightedError
    )

    expect(result.notes.length).toBeGreaterThan(0)
    expect(result.notes[0]).toHaveProperty('target')
    expect(result.notes[0]).toHaveProperty('delta')
    expect(result.notes[0]).toHaveProperty('reason')
  })

  it('should combine multiple boosts for cue reinforcement', () => {
    const combinedPrecision: PrecisionControl = {
      ...basePrecision,
      bottomUpWeight: 0.8,
    }

    const combinedError: PrecisionWeightedPredictionError = {
      ...baseWeightedError,
      effectivePredictionError: 0.8,
    }

    const result = applyPrecisionToSignalDynamics(
      combinedPrecision,
      combinedError
    )

    // Should get boost from both high bottom-up and high effective error
    expect(result.cueReinforcementGain).toBeGreaterThan(1.15)
    expect(result.notes.filter(n => n.target === 'signal_gain').length).toBeGreaterThanOrEqual(2)
  })
})
