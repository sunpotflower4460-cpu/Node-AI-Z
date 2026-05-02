import { describe, expect, it } from 'vitest'
import { normalizeSensoryPacket, normalizeFeatureVector } from '../normalizeSensoryPacket'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'
import { createTextSensoryPacket } from '../createTextSensoryPacket'

describe('normalizeFeatureVector', () => {
  it('clamps values above 1 to 1', () => {
    const result = normalizeFeatureVector({
      values: [1.5, 0.5, -0.2, 0.3, 0.8, 0.1, 0.4, 0.9],
      dimension: SENSORY_FEATURE_DIM,
      normalized: false,
    })
    expect(result.values[0]).toBe(1)
    expect(result.values[2]).toBe(0)
    expect(result.normalized).toBe(true)
  })

  it('pads short vector with zeros to SENSORY_FEATURE_DIM', () => {
    const result = normalizeFeatureVector({
      values: [0.5, 0.3],
      dimension: 2,
      normalized: false,
    })
    expect(result.values).toHaveLength(SENSORY_FEATURE_DIM)
    expect(result.values[2]).toBe(0)
  })

  it('trims long vector to SENSORY_FEATURE_DIM', () => {
    const result = normalizeFeatureVector({
      values: Array(20).fill(0.5) as number[],
      dimension: 20,
      normalized: false,
    })
    expect(result.values).toHaveLength(SENSORY_FEATURE_DIM)
  })

  it('returns same reference when already normalized and correct length', () => {
    const features = {
      values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      dimension: SENSORY_FEATURE_DIM,
      normalized: true,
    }
    const result = normalizeFeatureVector(features)
    expect(result).toBe(features)
  })
})

describe('normalizeSensoryPacket', () => {
  it('returns a valid packet with all features in [0, 1]', () => {
    const packet = createTextSensoryPacket('test normalize')
    const normalized = normalizeSensoryPacket(packet)
    normalized.features.values.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    })
  })
})
