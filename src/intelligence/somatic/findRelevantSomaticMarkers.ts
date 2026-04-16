import type { SomaticSignature, SomaticMarker } from './types'

const scoreMarker = (current: SomaticSignature, marker: SomaticMarker): number => {
  const currentNarSet = new Set(current.narrativeIds)
  const currentSenSet = new Set(current.sensoryIds)

  let score = 0
  let hasSemanticOverlap = false

  for (const id of marker.signature.narrativeIds) {
    if (currentNarSet.has(id)) {
      score += 2
      hasSemanticOverlap = true
    }
  }

  for (const id of marker.signature.sensoryIds) {
    if (currentSenSet.has(id)) {
      score += 1
      hasSemanticOverlap = true
    }
  }

  if (!hasSemanticOverlap) {
    return 0
  }

  const cf = current.fieldShape
  const mf = marker.signature.fieldShape
  if (cf.closenessBand === mf.closenessBand) score += 0.5
  if (cf.fragilityBand === mf.fragilityBand) score += 0.5
  if (cf.urgencyBand === mf.urgencyBand) score += 0.5
  if (cf.answerPressureBand === mf.answerPressureBand) score += 0.5

  score += 0.1 * Math.min(marker.count, 10)

  return score
}

export const findRelevantSomaticMarkers = (
  current: SomaticSignature,
  markers: SomaticMarker[],
): SomaticMarker[] => {
  return markers
    .map((marker) => ({ marker, score: scoreMarker(current, marker) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ marker }) => marker)
}
