import type { FacadeView } from '../facadeRuntime/facadeRuntimeTypes'
import type { PresentationBiasProfile } from './surfaceTranslatorTypes'

type HighlightResult = {
  highlightKeys: string[]
  notes: string[]
}

const uniquePush = (list: string[], value: string) => {
  if (!list.includes(value)) {
    list.push(value)
  }
}

const pickTopMixedNode = (view: FacadeView): string | undefined => {
  const sorted = [...view.visibleMixedNodes].sort((first, second) => {
    return (second.salience ?? 0) - (first.salience ?? 0)
  })
  return sorted[0]?.key
}

const hasBiasKey = (view: FacadeView, key: string) => {
  return Object.prototype.hasOwnProperty.call(view.visibleBiases, key)
}

export const buildSurfaceHighlights = (
  rawFacadeView: FacadeView,
  profile: PresentationBiasProfile
): HighlightResult => {
  const highlightKeys: string[] = []
  const notes: string[] = []

  const branchSchemaCount = rawFacadeView.visibleSchemas.filter(
    (schema) => schema.origin === 'personal_branch'
  ).length
  const trunkSchemaCount = rawFacadeView.visibleSchemas.filter(
    (schema) => schema.origin === 'shared_trunk'
  ).length
  const promotionCount = rawFacadeView.promotionCandidates?.length ?? 0
  const hasSession = rawFacadeView.sessionSnapshot.hasActiveSession
  const dominantMixedNode = pickTopMixedNode(rawFacadeView)

  if (hasSession) {
    uniquePush(highlightKeys, 'session_continuity')
    notes.push('Active session metadata present')
  }

  switch (profile.mode) {
    case 'crystallized_thinking': {
      if (branchSchemaCount > 0) {
        uniquePush(highlightKeys, 'branch_summary')
        notes.push('Branch schemas are foregrounded')
      }
      if (dominantMixedNode) {
        uniquePush(highlightKeys, `mixed:${dominantMixedNode}`)
        notes.push(`Dominant mixed node ${dominantMixedNode} highlighted`)
      }
      if (hasBiasKey(rawFacadeView, 'continuity')) {
        uniquePush(highlightKeys, 'bias:continuity')
      }
      if (hasBiasKey(rawFacadeView, 'precision')) {
        uniquePush(highlightKeys, 'bias:precision')
      }
      break
    }
    case 'observer': {
      if (promotionCount > 0) {
        uniquePush(highlightKeys, 'promotion_summary')
        notes.push('Promotion candidates visible')
      }
      if (rawFacadeView.influenceNotes && rawFacadeView.influenceNotes.length > 0) {
        uniquePush(highlightKeys, 'guardian_review')
        notes.push('Influence / guardian notes available')
      }
      if (trunkSchemaCount !== branchSchemaCount) {
        uniquePush(highlightKeys, 'trunk_branch_delta')
      }
      if (hasBiasKey(rawFacadeView, 'consistency')) {
        uniquePush(highlightKeys, 'bias:consistency')
      }
      break
    }
    case 'future_app': {
      if (branchSchemaCount > 0) {
        uniquePush(highlightKeys, 'branch_micro_summary')
        notes.push('Future app uses branch summary lightly')
      }
      if (hasSession) {
        uniquePush(highlightKeys, 'session_glimpse')
      }
      break
    }
    default: {
      if (branchSchemaCount > 0) {
        uniquePush(highlightKeys, 'branch_summary')
      }
    }
  }

  return {
    highlightKeys: highlightKeys.slice(0, profile.highlightTopN),
    notes,
  }
}
