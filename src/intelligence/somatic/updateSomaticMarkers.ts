import type { SomaticMarker, SomaticMarkerOutcome, SomaticSignature } from './types'
import type { UserTuningAction } from '../../revision/types'

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

const makeSomaticId = () =>
  `somatic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const movingAvgOutcome = (
  existing: SomaticMarkerOutcome,
  count: number,
  newOutcome: SomaticMarkerOutcome,
): SomaticMarkerOutcome => ({
  naturalness: clamp((existing.naturalness * count + newOutcome.naturalness) / (count + 1)),
  safety: clamp((existing.safety * count + newOutcome.safety) / (count + 1)),
  helpfulness: clamp((existing.helpfulness * count + newOutcome.helpfulness) / (count + 1)),
  openness: clamp((existing.openness * count + newOutcome.openness) / (count + 1)),
})

const isMatchingMarker = (
  marker: SomaticMarker,
  signature: SomaticSignature,
  decisionShape: SomaticMarker['decisionShape'],
): boolean => {
  if (marker.decisionShape.stance !== decisionShape.stance) return false

  const markerNarSet = new Set(marker.signature.narrativeIds)
  const hasNarrativeOverlap = signature.narrativeIds.some((id) => markerNarSet.has(id))

  if (!hasNarrativeOverlap) return false

  if (signature.sensoryIds.length === 0) return true

  const markerSenSet = new Set(marker.signature.sensoryIds)
  return signature.sensoryIds.some((id) => markerSenSet.has(id))
}

export const updateSomaticMarkers = (
  previousMarkers: SomaticMarker[],
  signature: SomaticSignature,
  decisionShape: SomaticMarker['decisionShape'],
  outcome: SomaticMarkerOutcome,
  timestamp: number,
): SomaticMarker[] => {
  const matchIndex = previousMarkers.findIndex((m) =>
    isMatchingMarker(m, signature, decisionShape),
  )

  if (matchIndex >= 0) {
    const existing = previousMarkers[matchIndex]
    const updated: SomaticMarker = {
      ...existing,
      outcome: movingAvgOutcome(existing.outcome, existing.count, outcome),
      count: existing.count + 1,
      updatedAt: timestamp,
    }
    return [
      ...previousMarkers.slice(0, matchIndex),
      updated,
      ...previousMarkers.slice(matchIndex + 1),
    ]
  }

  const newMarker: SomaticMarker = {
    id: makeSomaticId(),
    signature,
    decisionShape,
    outcome,
    count: 1,
    updatedAt: timestamp,
  }

  return [...previousMarkers, newMarker]
}

export const somaticOutcomeFromTuningAction = (action: UserTuningAction): SomaticMarkerOutcome => {
  switch (action) {
    case 'keep':
      return { naturalness: 0.3, safety: 0.2, helpfulness: 0.3, openness: 0.1 }
    case 'soften':
      return { naturalness: -0.1, safety: 0.1, helpfulness: 0.0, openness: 0.2 }
    case 'revert':
      return { naturalness: -0.4, safety: -0.2, helpfulness: -0.3, openness: 0.0 }
    case 'lock':
      return { naturalness: 0.2, safety: 0.3, helpfulness: 0.2, openness: 0.0 }
    default:
      return { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 }
  }
}
