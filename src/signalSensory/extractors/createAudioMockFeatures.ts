import type { SensoryFeatureVector } from '../sensoryPacketTypes'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'

/**
 * Creates a mock audio feature set for use when a real AudioBuffer is unavailable.
 *
 * Accepts an optional string description and derives a weak deterministic
 * feature vector from it so different descriptions produce different vectors.
 * All values are low-energy and near-zero to represent "unknown audio".
 */
export function createAudioMockFeatures(description = ''): SensoryFeatureVector {
  // Derive a weak pseudo-random seed from the description
  let seed = 0
  for (let i = 0; i < description.length; i++) {
    seed = (seed * 31 + description.charCodeAt(i)) & 0xffff
  }

  function pseudoRand(): number {
    seed = (seed * 1664525 + 1013904223) & 0xffff
    return (seed & 0xff) / 255
  }

  // Intentionally small values — this is a mock/placeholder, not real audio
  const base = 0.05
  const values = Array.from({ length: SENSORY_FEATURE_DIM }, () =>
    Math.min(1, base + pseudoRand() * 0.15),
  )

  return {
    values,
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: AUDIO_MOCK_FEATURE_NAMES,
  }
}

export const AUDIO_MOCK_FEATURE_NAMES: string[] = [
  'amplitudeMean_mock',
  'amplitudeMax_mock',
  'amplitudeVariance_mock',
  'zeroCrossRate_mock',
  'energyLow_mock',
  'energyMid_mock',
  'energyHigh_mock',
  'rhythmScore_mock',
]
