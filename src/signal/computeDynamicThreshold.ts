import type { DynamicThreshold } from './ingest/chunkTypes'

const BASE_THRESHOLD = 0.35
const MAX_THRESHOLD = 0.55
const MIN_THRESHOLD = 0.20

/**
 * Compute a dynamic activation threshold based on recent activity level.
 *
 * recentActivityScore (0–1):
 *   - High  (> 0.7): threshold rises  — "after a heavy topic, slightly duller"
 *   - Low   (< 0.3): threshold falls  — "after quiet, more sensitive"
 *   - Mid   (0.3–0.7): base threshold
 */
export const computeDynamicThreshold = (recentActivityScore: number): DynamicThreshold => {
  const clamped = Math.max(0, Math.min(1, recentActivityScore))
  let current = BASE_THRESHOLD

  if (clamped > 0.7) {
    // Scale from 0 at 0.7 to +0.2 at 1.0
    const factor = (clamped - 0.7) / 0.3
    current = BASE_THRESHOLD + factor * (MAX_THRESHOLD - BASE_THRESHOLD)
  } else if (clamped < 0.3) {
    // Scale from 0 at 0.3 to -0.15 at 0.0
    const factor = (0.3 - clamped) / 0.3
    current = BASE_THRESHOLD - factor * (BASE_THRESHOLD - MIN_THRESHOLD)
  }

  return {
    base: BASE_THRESHOLD,
    current: Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, current)),
    recentActivityScore: clamped,
  }
}
