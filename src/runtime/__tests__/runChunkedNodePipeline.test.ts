import { describe, it, expect } from 'vitest'
import { chunkText } from '../../signal/ingest/chunkText'
import { activateChunkFeatures } from '../../signal/ingest/activateChunkFeatures'
import { applyFeatureInhibition } from '../../signal/applyFeatureInhibition'
import { computeDynamicThreshold } from '../../signal/computeDynamicThreshold'
import { buildNodeActivationsFromFeatures } from '../../signal/buildNodeActivationsFromFeatures'
import { runChunkedNodePipeline } from '../runChunkedNodePipeline'

// ── chunkText ─────────────────────────────────────────────────────────────────

describe('chunkText', () => {
  it('splits on 、', () => {
    const chunks = chunkText('意欲が湧かなくて、困っています')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
  })

  it('splits on 。', () => {
    const chunks = chunkText('毎日同じことの繰り返しです。転職を考えるべきか悩んでいる。')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
  })

  it('assigns sequential indices starting from 0', () => {
    const chunks = chunkText('何のために働いているのか、転職すべきか')
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i)
    })
  })

  it('returns a single chunk for text with no split markers', () => {
    const chunks = chunkText('なんとなく引っかかる')
    expect(chunks.length).toBe(1)
    expect(chunks[0].text).toBe('なんとなく引っかかる')
  })

  it('returns empty array for empty string', () => {
    expect(chunkText('')).toHaveLength(0)
  })

  it('discards very short fragments', () => {
    const chunks = chunkText('あ、意欲が湧かない')
    // 'あ' is 1 char — should be discarded
    expect(chunks.every((c) => c.text.length >= 2)).toBe(true)
  })
})

// ── activateChunkFeatures ─────────────────────────────────────────────────────

describe('activateChunkFeatures', () => {
  it('activates motivation_drop from キーワード', () => {
    const chunks = chunkText('意欲が湧かない')
    const features = activateChunkFeatures(chunks)
    expect(features.some((f) => f.id === 'motivation_drop')).toBe(true)
  })

  it('activates monotony for 繰り返し', () => {
    const chunks = chunkText('毎日同じことの繰り返しでつらい')
    const features = activateChunkFeatures(chunks)
    expect(features.some((f) => f.id === 'monotony')).toBe(true)
  })

  it('activates uncertainty_expression for なんとなく', () => {
    const chunks = chunkText('なんとなく引っかかるけど、まだ言葉にできない')
    const features = activateChunkFeatures(chunks)
    expect(features.some((f) => f.id === 'uncertainty_expression')).toBe(true)
  })

  it('returns no features for unrelated text', () => {
    const chunks = chunkText('abcxyz')
    const features = activateChunkFeatures(chunks)
    expect(features).toHaveLength(0)
  })

  it('rawStrength is within 0-1', () => {
    const chunks = chunkText('意欲が湧かない、やる気が出ない、気力がない')
    const features = activateChunkFeatures(chunks)
    features.forEach((f) => {
      expect(f.rawStrength).toBeGreaterThan(0)
      expect(f.rawStrength).toBeLessThanOrEqual(1)
    })
  })
})

// ── applyFeatureInhibition ────────────────────────────────────────────────────

describe('applyFeatureInhibition', () => {
  it('reduces hope_signal strength when motivation_drop is present', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.8, strength: 0.8, sourceChunkIndices: [0] },
      { id: 'hope_signal', rawStrength: 0.5, strength: 0.5, sourceChunkIndices: [1] },
    ]
    const result = applyFeatureInhibition(features)
    const hope = result.find((f) => f.id === 'hope_signal')!
    expect(hope.strength).toBeLessThan(0.5)
  })

  it('does not affect features with no inhibitory relationship', () => {
    const features = [
      { id: 'temporal_contrast', rawStrength: 0.7, strength: 0.7, sourceChunkIndices: [0] },
      { id: 'longing_for_recognition', rawStrength: 0.6, strength: 0.6, sourceChunkIndices: [1] },
    ]
    const result = applyFeatureInhibition(features)
    const temporal = result.find((f) => f.id === 'temporal_contrast')!
    const longing = result.find((f) => f.id === 'longing_for_recognition')!
    expect(temporal.strength).toBe(0.7)
    expect(longing.strength).toBe(0.6)
  })

  it('clamps inhibited strength to 0 minimum', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
      { id: 'monotony', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
      { id: 'distress_signal', rawStrength: 0.8, strength: 0.8, sourceChunkIndices: [1] },
      { id: 'hope_signal', rawStrength: 0.1, strength: 0.1, sourceChunkIndices: [2] },
    ]
    const result = applyFeatureInhibition(features)
    const hope = result.find((f) => f.id === 'hope_signal')!
    expect(hope.strength).toBeGreaterThanOrEqual(0)
  })
})

// ── computeDynamicThreshold ───────────────────────────────────────────────────

describe('computeDynamicThreshold', () => {
  it('returns base threshold for neutral activity (0.5)', () => {
    const result = computeDynamicThreshold(0.5)
    expect(result.current).toBeCloseTo(result.base, 3)
  })

  it('raises threshold for high activity (0.9)', () => {
    const neutral = computeDynamicThreshold(0.5)
    const high = computeDynamicThreshold(0.9)
    expect(high.current).toBeGreaterThan(neutral.current)
  })

  it('lowers threshold for low activity (0.1)', () => {
    const neutral = computeDynamicThreshold(0.5)
    const low = computeDynamicThreshold(0.1)
    expect(low.current).toBeLessThan(neutral.current)
  })

  it('keeps current within 0.2–0.55 range', () => {
    [0, 0.1, 0.5, 0.9, 1].forEach((score) => {
      const result = computeDynamicThreshold(score)
      expect(result.current).toBeGreaterThanOrEqual(0.2)
      expect(result.current).toBeLessThanOrEqual(0.55)
    })
  })

  it('clamps out-of-range recentActivityScore', () => {
    const below = computeDynamicThreshold(-1)
    const above = computeDynamicThreshold(2)
    expect(below.recentActivityScore).toBe(0)
    expect(above.recentActivityScore).toBe(1)
  })
})

// ── buildNodeActivationsFromFeatures ─────────────────────────────────────────

describe('buildNodeActivationsFromFeatures', () => {
  it('maps motivation_drop to fatigue node', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.8, strength: 0.8, sourceChunkIndices: [0] },
    ]
    const nodes = buildNodeActivationsFromFeatures(features)
    expect(nodes.some((n) => n.id === 'fatigue')).toBe(true)
  })

  it('adds activationProfile to each node', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.8, strength: 0.8, sourceChunkIndices: [0] },
    ]
    const nodes = buildNodeActivationsFromFeatures(features)
    const fatigue = nodes.find((n) => n.id === 'fatigue')!
    expect(fatigue.activationProfile).toBeDefined()
    expect(fatigue.activationProfile!['motivation_drop']).toBeGreaterThan(0)
  })

  it('combines contributions from multiple features into one node', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.7, strength: 0.7, sourceChunkIndices: [0] },
      { id: 'monotony', rawStrength: 0.6, strength: 0.6, sourceChunkIndices: [1] },
    ]
    const nodes = buildNodeActivationsFromFeatures(features)
    const fatigue = nodes.find((n) => n.id === 'fatigue')!
    // fatigue receives from both motivation_drop and monotony
    expect(Object.keys(fatigue.activationProfile!).length).toBeGreaterThanOrEqual(2)
  })

  it('clamps node value to <= 0.99', () => {
    const features = [
      { id: 'motivation_drop', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
      { id: 'monotony', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
      { id: 'temporal_contrast', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
    ]
    const nodes = buildNodeActivationsFromFeatures(features)
    nodes.forEach((n) => {
      expect(n.value).toBeLessThanOrEqual(0.99)
    })
  })

  it('returns empty array when no features are provided', () => {
    expect(buildNodeActivationsFromFeatures([])).toHaveLength(0)
  })
})

// ── runChunkedNodePipeline ────────────────────────────────────────────────────

describe('runChunkedNodePipeline', () => {
  it('returns a chunkedStage with chunks and features', () => {
    const result = runChunkedNodePipeline('意欲が湧かなくて、転職すべきか悩んでいる')
    expect(result.chunkedStage.chunks.length).toBeGreaterThan(0)
  })

  it('activates at least one node', () => {
    const result = runChunkedNodePipeline('意欲が湧かなくて、転職すべきか悩んでいる')
    expect(result.activatedNodes.length).toBeGreaterThanOrEqual(1)
  })

  it('returns valid NodePipelineResult shape', () => {
    const result = runChunkedNodePipeline('意欲が湧かなくて、転職すべきか悩んでいる')
    expect(Array.isArray(result.activatedNodes)).toBe(true)
    expect(Array.isArray(result.suppressedNodes)).toBe(true)
    expect(Array.isArray(result.bindings)).toBe(true)
    expect(Array.isArray(result.liftedPatterns)).toBe(true)
    expect(result.stateVector).toBeDefined()
    expect(result.meta).toBeDefined()
  })

  it('falls back to processing node for unrecognised input', () => {
    const result = runChunkedNodePipeline('abcxyz')
    expect(result.activatedNodes.some((n) => n.id === 'processing')).toBe(true)
  })

  it('activationProfile is set on nodes when features fired', () => {
    const result = runChunkedNodePipeline('意欲が湧かない')
    const nodesWithProfile = result.activatedNodes.filter((n) => n.activationProfile)
    expect(nodesWithProfile.length).toBeGreaterThan(0)
  })

  it('dynamic threshold affects activation (high activity suppresses weak features)', () => {
    const lowActivity = runChunkedNodePipeline('なんとなく引っかかる', undefined, 0.1)
    const highActivity = runChunkedNodePipeline('なんとなく引っかかる', undefined, 0.95)
    // High threshold may suppress marginal features → fewer active features or nodes
    expect(lowActivity.chunkedStage.threshold.current).toBeLessThan(highActivity.chunkedStage.threshold.current)
  })

  it('does not throw and returns debugNotes for any input', () => {
    const result = runChunkedNodePipeline('')
    expect(Array.isArray(result.debugNotes)).toBe(true)
    expect(result.debugNotes.length).toBeGreaterThan(0)
  })

  it('suppresses relevant nodes when fatigue is activated', () => {
    const result = runChunkedNodePipeline('意欲が湧かなくて、毎日同じことの繰り返し')
    if (result.activatedNodes.some((n) => n.id === 'fatigue')) {
      expect(result.suppressedNodes.some((n) => n.id === 'excitement')).toBe(true)
    }
  })
})
