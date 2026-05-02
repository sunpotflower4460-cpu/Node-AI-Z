import type { SensoryPacket, SensoryModality } from './sensoryPacketTypes'
import type { ParticleStimulus } from '../signalField/signalFieldTypes'

/**
 * Maps a SensoryModality to a base x-coordinate in the particle field.
 * Different modalities activate distinct spatial regions of the field,
 * preventing them from being immediately merged into the same assemblies.
 */
const MODALITY_BASE_X: Record<SensoryModality, number> = {
  text: 0.25,
  image: 0.50,
  audio: 0.75,
  event: 0.50,
  synthetic_text: 0.30,
  synthetic_image: 0.55,
  synthetic_audio: 0.70,
}

/**
 * Converts a normalized SensoryPacket into a ParticleStimulus for injection
 * into the Signal Field.
 *
 * Spatial mapping:
 *  x = modality base_x + small offset from features[0]
 *  y = features[1]  (0-1)
 *  z = features[2]  (0-1)
 *  strength = mean of all feature values × extractionConfidence
 *
 * Extra feature values beyond index 2 are appended to the vector for
 * any downstream consumers that read additional dimensions.
 */
export function sensoryPacketToInjectionVector(packet: SensoryPacket): ParticleStimulus {
  const { features, modality, confidence } = packet
  const v = features.values

  const baseX = MODALITY_BASE_X[modality] ?? 0.5

  // x: modality base ± small feature-driven offset
  const x = Math.min(1, Math.max(0, baseX + (v[0]! - 0.5) * 0.15))
  // y: use features[1] scaled to cover the [0.2, 0.8] range to stay in the active region
  const y = Math.max(0, Math.min(1, (v[1] ?? 0.5) * 0.6 + 0.2))
  // z: always 0 — all stable-field particles have z=0 (see createStableParticleField).
  // Non-zero z increases the 3D distance to every particle, reducing ignition probability.
  // features[2] is preserved in the vector array (index 5+) for downstream consumers.
  const z = 0

  // Strength: scale feature mean, ensuring it exceeds particle activation threshold (0.3)
  const featureMean = v.reduce((sum, val) => sum + val, 0) / Math.max(v.length, 1)
  const strength = Math.min(
    1,
    Math.max(0.4, featureMean * 2.0 * confidence.extractionConfidence),
  )

  // Full vector: [x, y, z, ...remaining features]
  const vector = [x, y, z, ...v.slice(3)]

  return {
    modality: mapToParticleModality(modality),
    vector,
    strength,
    timestamp: packet.createdAt,
  }
}

/**
 * Maps extended SensoryModality to the ParticleStimulus modality (text/image/audio).
 */
function mapToParticleModality(
  modality: SensoryModality,
): 'text' | 'image' | 'audio' {
  if (modality === 'image' || modality === 'synthetic_image') return 'image'
  if (modality === 'audio' || modality === 'synthetic_audio') return 'audio'
  return 'text'
}
