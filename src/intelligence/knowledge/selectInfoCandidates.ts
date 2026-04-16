import type { Signal } from '../signal/types'
import type { InfoEntry, InfoLayer } from './types'

/**
 * Select info entries relevant to the currently activated signals.
 *
 * Each entry is scored by base relevance plus bonuses for key matches
 * against the signal id or label. The top-N entries are returned.
 */
export const selectInfoCandidates = (
  infoLayer: InfoLayer,
  signals: Signal[],
  topN = 3,
): InfoEntry[] => {
  if (infoLayer.entries.length === 0) return []

  const signalIds = new Set(signals.map((s) => s.id))
  const signalLabels = new Set(signals.map((s) => s.label))

  const scored = infoLayer.entries.map((entry) => {
    let score = entry.relevance
    if (signalIds.has(entry.key)) score += 0.5
    if (signalLabels.has(entry.key)) score += 0.3
    return { entry, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((x) => x.entry)
}
