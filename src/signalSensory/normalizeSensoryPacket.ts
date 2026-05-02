import type { SensoryPacket, SensoryFeatureVector } from './sensoryPacketTypes'
import { SENSORY_FEATURE_DIM } from './sensoryPacketTypes'

/**
 * Ensures all feature vector values are clamped to [0, 1] and that the
 * dimension matches SENSORY_FEATURE_DIM. Pads with zeros or trims if needed.
 *
 * Returns a new SensoryPacket with a guaranteed-normalized feature vector.
 */
export function normalizeSensoryPacket(packet: SensoryPacket): SensoryPacket {
  const normalizedFeatures = normalizeFeatureVector(packet.features)
  if (normalizedFeatures === packet.features) return packet
  return { ...packet, features: normalizedFeatures }
}

export function normalizeFeatureVector(
  features: SensoryFeatureVector,
): SensoryFeatureVector {
  const values = features.values
  let changed = false

  // Ensure correct length
  let padded: number[]
  if (values.length !== SENSORY_FEATURE_DIM) {
    padded = Array(SENSORY_FEATURE_DIM).fill(0) as number[]
    for (let i = 0; i < Math.min(values.length, SENSORY_FEATURE_DIM); i++) {
      padded[i] = values[i]!
    }
    changed = true
  } else {
    padded = [...values]
  }

  // Clamp all values to [0, 1]
  for (let i = 0; i < SENSORY_FEATURE_DIM; i++) {
    const clamped = Math.min(1, Math.max(0, padded[i]!))
    if (clamped !== padded[i]) {
      padded[i] = clamped
      changed = true
    }
  }

  if (!changed && features.normalized) return features

  return {
    values: padded,
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: features.featureNames,
  }
}
