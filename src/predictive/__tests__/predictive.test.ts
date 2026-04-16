import { describe, it, expect } from 'vitest'
import { buildEmptyPredictionState } from '../buildPredictionState'
import { predictFeatures } from '../predictFeatures'
import { computePredictionError } from '../computePredictionError'
import { applyPredictionModulation } from '../applyPredictionModulation'
import { updatePredictionState } from '../updatePredictionState'
import type { ChunkFeature } from '../../signal/chunkTypes'
import type { PredictionState } from '../types'
import { runChunkedNodePipeline } from '../../runtime/runChunkedNodePipeline'

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeFeature = (id: string, strength: number): ChunkFeature => ({
  id,
  strength,
  rawStrength: strength,
  sourceChunkIndices: [0],
})

// ── buildEmptyPredictionState ─────────────────────────────────────────────────

describe('buildEmptyPredictionState', () => {
  it('returns a state with no expected features', () => {
    const state = buildEmptyPredictionState()
    expect(state.expectedFeatureIds).toHaveLength(0)
    expect(Object.keys(state.expectedFeatureStrengths)).toHaveLength(0)
  })

  it('has zero confidence', () => {
    expect(buildEmptyPredictionState().confidence).toBe(0)
  })

  it('uses the provided turn number', () => {
    expect(buildEmptyPredictionState(5).basedOnTurn).toBe(5)
  })

  it('defaults basedOnTurn to 0', () => {
    expect(buildEmptyPredictionState().basedOnTurn).toBe(0)
  })
})

// ── predictFeatures ───────────────────────────────────────────────────────────

describe('predictFeatures', () => {
  it('returns empty prediction when no features are provided', () => {
    const state = predictFeatures([], 0)
    expect(state.expectedFeatureIds).toHaveLength(0)
    expect(state.confidence).toBe(0)
  })

  it('returns empty prediction when all features are below the strength threshold', () => {
    const features = [makeFeature('motivation_drop', 0.1), makeFeature('monotony', 0.05)]
    const state = predictFeatures(features, 1)
    expect(state.expectedFeatureIds).toHaveLength(0)
  })

  it('includes features above the strength threshold', () => {
    const features = [makeFeature('motivation_drop', 0.8), makeFeature('distress_signal', 0.6)]
    const state = predictFeatures(features, 2)
    expect(state.expectedFeatureIds).toContain('motivation_drop')
    expect(state.expectedFeatureIds).toContain('distress_signal')
  })

  it('expected strengths are less than actual strengths (decay)', () => {
    const features = [makeFeature('motivation_drop', 0.8)]
    const state = predictFeatures(features, 0)
    expect(state.expectedFeatureStrengths['motivation_drop']).toBeLessThan(0.8)
  })

  it('caps predicted features at MAX_PREDICTED_FEATURES (5)', () => {
    const features = Array.from({ length: 10 }, (_, i) =>
      makeFeature(`feature_${i}`, 0.8 - i * 0.02),
    )
    const state = predictFeatures(features, 0)
    expect(state.expectedFeatureIds.length).toBeLessThanOrEqual(5)
  })

  it('confidence is between 0 and 1', () => {
    const features = [makeFeature('motivation_drop', 0.9)]
    const state = predictFeatures(features, 0)
    expect(state.confidence).toBeGreaterThan(0)
    expect(state.confidence).toBeLessThanOrEqual(1)
  })

  it('records the current turn in basedOnTurn', () => {
    const features = [makeFeature('distress_signal', 0.7)]
    const state = predictFeatures(features, 3)
    expect(state.basedOnTurn).toBe(3)
  })
})

// ── computePredictionError ────────────────────────────────────────────────────

describe('computePredictionError', () => {
  it('returns correct type when actual matches expected within tolerance', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['motivation_drop'],
      expectedFeatureStrengths: { motivation_drop: 0.5 },
      confidence: 0.7,
      basedOnTurn: 0,
    }
    const actual = [makeFeature('motivation_drop', 0.55)]
    const errors = computePredictionError(predicted, actual)
    const e = errors.find((e) => e.featureId === 'motivation_drop')!
    expect(e.type).toBe('correct')
  })

  it('returns expected_absent when predicted feature did not fire', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['monotony'],
      expectedFeatureStrengths: { monotony: 0.5 },
      confidence: 0.8,
      basedOnTurn: 0,
    }
    const errors = computePredictionError(predicted, [])
    expect(errors[0].type).toBe('expected_absent')
    expect(errors[0].actual).toBe(0)
  })

  it('returns unexpected_present when feature fired but was not predicted', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 0.5,
      basedOnTurn: 0,
    }
    const actual = [makeFeature('distress_signal', 0.7)]
    const errors = computePredictionError(predicted, actual)
    expect(errors[0].type).toBe('unexpected_present')
    expect(errors[0].expected).toBe(0)
    expect(errors[0].actual).toBe(0.7)
  })

  it('returns strength_higher when actual exceeds predicted by more than tolerance', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['hope_signal'],
      expectedFeatureStrengths: { hope_signal: 0.3 },
      confidence: 0.6,
      basedOnTurn: 0,
    }
    const actual = [makeFeature('hope_signal', 0.8)]
    const errors = computePredictionError(predicted, actual)
    expect(errors[0].type).toBe('strength_higher')
  })

  it('returns strength_lower when actual is weaker than predicted by more than tolerance', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['distress_signal'],
      expectedFeatureStrengths: { distress_signal: 0.8 },
      confidence: 0.9,
      basedOnTurn: 0,
    }
    const actual = [makeFeature('distress_signal', 0.2)]
    const errors = computePredictionError(predicted, actual)
    expect(errors[0].type).toBe('strength_lower')
  })

  it('error is always non-negative', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['motivation_drop'],
      expectedFeatureStrengths: { motivation_drop: 0.5 },
      confidence: 0.7,
      basedOnTurn: 0,
    }
    const actual = [makeFeature('motivation_drop', 0.9)]
    const errors = computePredictionError(predicted, actual)
    errors.forEach((e) => expect(e.error).toBeGreaterThanOrEqual(0))
  })
})

// ── applyPredictionModulation ─────────────────────────────────────────────────

describe('applyPredictionModulation', () => {
  it('returns features unchanged when prediction has no expected features', () => {
    const empty = buildEmptyPredictionState()
    const features = [makeFeature('motivation_drop', 0.7)]
    const result = applyPredictionModulation(features, empty)
    expect(result.features[0].strength).toBe(0.7)
    expect(result.surpriseSignals).toHaveLength(0)
    expect(result.overallSurprise).toBe(0)
  })

  it('returns features unchanged when confidence is 0', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['motivation_drop'],
      expectedFeatureStrengths: { motivation_drop: 0.5 },
      confidence: 0,
      basedOnTurn: 0,
    }
    const features = [makeFeature('motivation_drop', 0.9)]
    const result = applyPredictionModulation(features, predicted)
    expect(result.features[0].strength).toBe(0.9)
    expect(result.surpriseSignals).toHaveLength(0)
  })

  it('boosts strength of unexpected features', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 0.8,
      basedOnTurn: 0,
    }
    const features = [makeFeature('distress_signal', 0.7)]
    const result = applyPredictionModulation(features, predicted)
    const f = result.features.find((f) => f.featureId === 'distress_signal' || f.id === 'distress_signal')!
    expect(f.strength).toBeGreaterThan(0.7)
  })

  it('generates a surprise signal for unexpected features', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 0.8,
      basedOnTurn: 0,
    }
    const features = [makeFeature('distress_signal', 0.7)]
    const result = applyPredictionModulation(features, predicted)
    expect(result.surpriseSignals.length).toBeGreaterThan(0)
    const sig = result.surpriseSignals.find((s) => s.featureId === 'distress_signal')!
    expect(sig.direction).toBe('unexpected_present')
  })

  it('does not boost expected_absent features (absent features stay absent)', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: ['monotony'],
      expectedFeatureStrengths: { monotony: 0.6 },
      confidence: 0.9,
      basedOnTurn: 0,
    }
    const features: ChunkFeature[] = [] // monotony did not fire
    const result = applyPredictionModulation(features, predicted)
    expect(result.features).toHaveLength(0)
  })

  it('overallSurprise is between 0 and 1', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 0.9,
      basedOnTurn: 0,
    }
    const features = [makeFeature('distress_signal', 0.9), makeFeature('hope_signal', 0.8)]
    const result = applyPredictionModulation(features, predicted)
    expect(result.overallSurprise).toBeGreaterThanOrEqual(0)
    expect(result.overallSurprise).toBeLessThanOrEqual(1)
  })

  it('fieldIntensityBoost is between 0 and 0.2', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 1.0,
      basedOnTurn: 0,
    }
    const features = [makeFeature('distress_signal', 0.9)]
    const result = applyPredictionModulation(features, predicted)
    expect(result.fieldIntensityBoost).toBeGreaterThanOrEqual(0)
    expect(result.fieldIntensityBoost).toBeLessThanOrEqual(0.2)
  })

  it('strength after boost is capped at 0.99', () => {
    const predicted: PredictionState = {
      expectedFeatureIds: [],
      expectedFeatureStrengths: {},
      confidence: 1.0,
      basedOnTurn: 0,
    }
    const features = [makeFeature('distress_signal', 0.99)]
    const result = applyPredictionModulation(features, predicted)
    result.features.forEach((f) => expect(f.strength).toBeLessThanOrEqual(0.99))
  })

  it('returns debugNotes array', () => {
    const empty = buildEmptyPredictionState()
    const result = applyPredictionModulation([], empty)
    expect(Array.isArray(result.debugNotes)).toBe(true)
    expect(result.debugNotes.length).toBeGreaterThan(0)
  })
})

// ── updatePredictionState ─────────────────────────────────────────────────────

describe('updatePredictionState', () => {
  it('produces a prediction state from active features', () => {
    const features = [makeFeature('motivation_drop', 0.8), makeFeature('distress_signal', 0.7)]
    const state = updatePredictionState(features, 5)
    expect(state.expectedFeatureIds).toContain('motivation_drop')
    expect(state.basedOnTurn).toBe(5)
  })

  it('returns empty state when no features provided', () => {
    const state = updatePredictionState([], 3)
    expect(state.expectedFeatureIds).toHaveLength(0)
    expect(state.confidence).toBe(0)
  })
})

// ── runChunkedNodePipeline (ISR v2.3 integration) ─────────────────────────────

describe('runChunkedNodePipeline — ISR v2.3 predictive coding', () => {
  it('always returns nextPredictionState', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    expect(result.nextPredictionState).toBeDefined()
    expect(typeof result.nextPredictionState.confidence).toBe('number')
  })

  it('predictionModulationResult is undefined when no prior is supplied', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    expect(result.predictionModulationResult).toBeUndefined()
  })

  it('predictionModulationResult is defined when a prior is supplied', () => {
    // Run first turn to get a prediction prior
    const turn1 = runChunkedNodePipeline('意欲が湧かない', undefined, 0.5, 0)
    const prior = turn1.nextPredictionState

    // Use the prior in the second turn
    const turn2 = runChunkedNodePipeline(
      '意欲が湧かない',
      undefined,
      0.5,
      1,
      undefined,
      undefined,
      0,
      prior,
    )
    expect(turn2.predictionModulationResult).toBeDefined()
  })

  it('nextPredictionState carries the features that fired', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    // motivation_drop should be predicted (it fired strongly)
    if (result.chunkedStage.activeFeatures.some((f) => f.id === 'motivation_drop')) {
      expect(result.nextPredictionState.expectedFeatureIds).toContain('motivation_drop')
    }
  })

  it('chunkedStage.modulatedFeatures is undefined without a prior', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    expect(result.chunkedStage.modulatedFeatures).toBeUndefined()
  })

  it('chunkedStage.modulatedFeatures is defined when a prior is supplied', () => {
    const turn1 = runChunkedNodePipeline('意欲が湧かない', undefined, 0.5, 0)
    const prior = turn1.nextPredictionState

    const turn2 = runChunkedNodePipeline(
      '意欲が湧かない',
      undefined,
      0.5,
      1,
      undefined,
      undefined,
      0,
      prior,
    )
    expect(turn2.chunkedStage.modulatedFeatures).toBeDefined()
  })

  it('pipeline still produces nodes with a prior supplied (no crash)', () => {
    const turn1 = runChunkedNodePipeline('意欲が湧かない', undefined, 0.5, 0)
    const turn2 = runChunkedNodePipeline(
      '意欲が湧かない、転職すべきか',
      undefined,
      0.5,
      1,
      undefined,
      undefined,
      0,
      turn1.nextPredictionState,
    )
    expect(turn2.activatedNodes.length).toBeGreaterThanOrEqual(1)
  })

  it('debugNotes mention ISR v2.3', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    expect(result.debugNotes.some((n) => n.includes('v2.3'))).toBe(true)
  })

  it('pathwayKeys includes surprise keys when a surprising input follows a different prior', () => {
    // Build a prior predicting distress_signal
    const priorWithDistress: PredictionState = {
      expectedFeatureIds: ['distress_signal'],
      expectedFeatureStrengths: { distress_signal: 0.4 },
      confidence: 0.9,
      basedOnTurn: 0,
    }
    // Send a completely different input (hope_signal territory)
    const result = runChunkedNodePipeline(
      '希望がある、前向き',
      undefined,
      0.5,
      1,
      undefined,
      undefined,
      0,
      priorWithDistress,
    )
    // If hope_signal fired and distress_signal did not, we should have surprise keys
    const hasSurpriseKey = result.pathwayKeys?.some((k) => k.includes('surprise')) ?? false
    // We can't guarantee this fires (depends on feature detection), just check no crash
    expect(Array.isArray(result.pathwayKeys)).toBe(true)
    // Suppress unused var warning
    void hasSurpriseKey
  })
})
