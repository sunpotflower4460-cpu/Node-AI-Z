import type { ChunkFeature } from './ingest/chunkTypes'

/**
 * Inhibitory relationships between features.
 *
 * When a `source` feature fires, the `target` feature's strength is
 * reduced by `inhibition` (clamped to 0).
 */
const INHIBITORY_RULES: Array<{ source: string; target: string; inhibition: number }> = [
  { source: 'monotony', target: 'hope_signal', inhibition: 0.15 },
  { source: 'motivation_drop', target: 'hope_signal', inhibition: 0.2 },
  { source: 'distress_signal', target: 'hope_signal', inhibition: 0.1 },
  { source: 'self_critique', target: 'hope_signal', inhibition: 0.15 },
  { source: 'purpose_confusion', target: 'hope_signal', inhibition: 0.1 },
  { source: 'motivation_drop', target: 'explicit_guidance_request', inhibition: 0.05 },
  { source: 'hope_signal', target: 'distress_signal', inhibition: 0.1 },
]

/**
 * Apply lateral inhibition between features.
 *
 * Returns a new array of ChunkFeature where `strength` may be lower than
 * `rawStrength` due to inhibitory signals from other active features.
 */
export const applyFeatureInhibition = (features: ChunkFeature[]): ChunkFeature[] => {
  const activeIds = new Set(features.map((f) => f.id))
  const inhibitionTotals = new Map<string, number>()

  for (const rule of INHIBITORY_RULES) {
    if (activeIds.has(rule.source) && activeIds.has(rule.target)) {
      const current = inhibitionTotals.get(rule.target) ?? 0
      inhibitionTotals.set(rule.target, current + rule.inhibition)
    }
  }

  return features.map((feature) => {
    const totalInhibition = inhibitionTotals.get(feature.id) ?? 0
    const inhibitedStrength = Math.max(0, feature.strength - totalInhibition)
    return { ...feature, strength: inhibitedStrength }
  })
}
