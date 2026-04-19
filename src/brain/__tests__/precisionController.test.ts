/**
 * Tests for precisionController
 */

import { describe, it, expect } from 'vitest'
import { derivePrecisionControl } from '../precisionController'
import { createDefaultInteroceptiveState } from '../../interoception/interoceptiveState'
import type { UncertaintyState } from '../precisionTypes'

describe('derivePrecisionControl', () => {
  const baseUncertainty: UncertaintyState = {
    expectedness: 0.5,
    novelty: 0.5,
    ambiguity: 0.5,
    volatilityEstimate: 0.5,
    confidenceDrift: 0.5,
  }

  it('should increase learning and top-down weight with high safety and low overload', () => {
    const interoception = {
      ...createDefaultInteroceptiveState(),
      socialSafety: 0.8,
      overload: 0.2,
    }

    const result = derivePrecisionControl({
      interoception,
      uncertaintyState: baseUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.topDownWeight).toBeGreaterThan(0.5)
    expect(result.precisionControl.learningRate).toBeGreaterThan(0.5)
    expect(result.precisionControl.inhibitionGain).toBeLessThan(1.0)
    expect(result.notes.length).toBeGreaterThan(0)
  })

  it('should increase bottom-up weight and novelty boost with high novelty', () => {
    const highNoveltyUncertainty: UncertaintyState = {
      ...baseUncertainty,
      novelty: 0.8,
      expectedness: 0.2,
    }

    const result = derivePrecisionControl({
      interoception: createDefaultInteroceptiveState(),
      uncertaintyState: highNoveltyUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.bottomUpWeight).toBeGreaterThan(0.5)
    expect(result.precisionControl.noveltyBoost).toBeGreaterThan(0.2)
  })

  it('should increase inhibition and decrease learning with high overload', () => {
    const interoception = {
      ...createDefaultInteroceptiveState(),
      overload: 0.8,
      recoveryPressure: 0.7,
    }

    const result = derivePrecisionControl({
      interoception,
      uncertaintyState: baseUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.inhibitionGain).toBeGreaterThan(1.0)
    expect(result.precisionControl.learningRate).toBeLessThan(1.0)
  })

  it('should be cautious with high ambiguity and low safety', () => {
    const interoception = {
      ...createDefaultInteroceptiveState(),
      socialSafety: 0.3,
    }

    const highAmbiguityUncertainty: UncertaintyState = {
      ...baseUncertainty,
      ambiguity: 0.8,
    }

    const result = derivePrecisionControl({
      interoception,
      uncertaintyState: highAmbiguityUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.inhibitionGain).toBeGreaterThan(1.0)
    expect(result.precisionControl.safetyBias).toBeGreaterThan(0.5)
  })

  it('should increase exploration with high arousal and novelty hunger', () => {
    const interoception = {
      ...createDefaultInteroceptiveState(),
      arousal: 0.8,
      noveltyHunger: 0.8,
    }

    const result = derivePrecisionControl({
      interoception,
      uncertaintyState: baseUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.bottomUpWeight).toBeGreaterThan(0.5)
    expect(result.precisionControl.uncertaintyBias).toBeGreaterThan(0.5)
  })

  it('should blend with previous precision control (70/30)', () => {
    const previousControl = {
      bottomUpWeight: 0.9,
      topDownWeight: 0.2,
      noveltyBoost: 0.8,
      learningRate: 0.3,
      inhibitionGain: 0.7,
      uncertaintyBias: 0.6,
      safetyBias: 0.4,
    }

    const result = derivePrecisionControl({
      interoception: createDefaultInteroceptiveState(),
      uncertaintyState: baseUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
      previousPrecisionControl: previousControl,
    })

    // Should be blend of new and previous (closer to new)
    expect(result.precisionControl.bottomUpWeight).toBeGreaterThan(0.5)
    expect(result.precisionControl.bottomUpWeight).toBeLessThan(0.9)
  })

  it('should increase top-down with afterglow and high activity', () => {
    const result = derivePrecisionControl({
      interoception: createDefaultInteroceptiveState(),
      uncertaintyState: baseUncertainty,
      afterglow: 0.15,
      recentActivityAverage: 0.7,
      recentFieldIntensity: 0.5,
    })

    expect(result.precisionControl.topDownWeight).toBeGreaterThan(0.5)
  })

  it('should provide explanatory notes', () => {
    const interoception = {
      ...createDefaultInteroceptiveState(),
      socialSafety: 0.8,
      overload: 0.2,
    }

    const result = derivePrecisionControl({
      interoception,
      uncertaintyState: baseUncertainty,
      afterglow: 0.1,
      recentActivityAverage: 0.5,
      recentFieldIntensity: 0.5,
    })

    expect(result.notes.length).toBeGreaterThan(0)
    expect(result.notes[0]).toHaveProperty('target')
    expect(result.notes[0]).toHaveProperty('delta')
    expect(result.notes[0]).toHaveProperty('reason')
  })
})
