import type { SomaticMarker, SomaticInfluence, SomaticMarkerOutcome } from './types'

const clamp = (v: number, min = -1, max = 1) => Math.max(min, Math.min(max, v))

const emptyOutcome = (): SomaticMarkerOutcome => ({
  naturalness: 0,
  safety: 0,
  helpfulness: 0,
  openness: 0,
})

export const computeSomaticInfluence = (relevantMarkers: SomaticMarker[]): SomaticInfluence => {
  if (relevantMarkers.length === 0) {
    return {
      matchedMarkerIds: [],
      averageOutcome: emptyOutcome(),
      influenceStrength: 0,
      debugNotes: ['No relevant somatic markers found'],
    }
  }

  const totalCount = relevantMarkers.reduce((sum, m) => sum + m.count, 0)

  const weightedSum = relevantMarkers.reduce(
    (acc, m) => {
      const w = m.count
      acc.naturalness += m.outcome.naturalness * w
      acc.safety += m.outcome.safety * w
      acc.helpfulness += m.outcome.helpfulness * w
      acc.openness += m.outcome.openness * w
      return acc
    },
    { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 },
  )

  const averageOutcome: SomaticMarkerOutcome = {
    naturalness: clamp(weightedSum.naturalness / totalCount),
    safety: clamp(weightedSum.safety / totalCount),
    helpfulness: clamp(weightedSum.helpfulness / totalCount),
    openness: clamp(weightedSum.openness / totalCount),
  }

  const influenceStrength = Math.min(1.0, relevantMarkers.length * 0.15 + totalCount * 0.02)

  const debugNotes = relevantMarkers.map(
    (m) =>
      `marker ${m.id}: stance=${m.decisionShape.stance}, count=${m.count}, naturalness=${m.outcome.naturalness.toFixed(2)}`,
  )

  return {
    matchedMarkerIds: relevantMarkers.map((m) => m.id),
    averageOutcome,
    influenceStrength,
    debugNotes,
  }
}
