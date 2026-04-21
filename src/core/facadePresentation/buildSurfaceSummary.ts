import type { FacadeView } from '../facadeRuntime/facadeRuntimeTypes'
import type { PresentationBiasProfile } from './surfaceTranslatorTypes'

type SurfaceSummaryResult = {
  summary: string
  summaryNotes: string[]
}

export const buildSurfaceSummary = (
  rawFacadeView: FacadeView,
  highlightKeys: string[],
  profile: PresentationBiasProfile
): SurfaceSummaryResult => {
  const branchCount = rawFacadeView.visibleSchemas.filter(
    (schema) => schema.origin === 'personal_branch'
  ).length
  const trunkCount = rawFacadeView.visibleSchemas.filter(
    (schema) => schema.origin === 'shared_trunk'
  ).length
  const promotionCount = rawFacadeView.promotionCandidates?.length ?? 0
  const mixedNodeCount = rawFacadeView.visibleMixedNodes.length
  const sessionActive = rawFacadeView.sessionSnapshot.hasActiveSession

  const summaryNotes: string[] = []
  const highlightLabel =
    highlightKeys.length > 0 ? `highlights: ${highlightKeys.join(', ')}` : 'no highlights selected'

  let summary = ''

  switch (profile.summaryStyle) {
    case 'thinking': {
      summary = [
        'Branch-forward view',
        `${branchCount} branch schemas, ${mixedNodeCount} mixed nodes foregrounded`,
        sessionActive ? 'session continuity visible' : 'session inactive',
      ].join(' • ')
      break
    }
    case 'observe': {
      summary = [
        'Observation snapshot',
        `branch/trunk = ${branchCount}/${trunkCount}`,
        `promotion: ${promotionCount}`,
        sessionActive ? 'session live' : 'session idle',
      ].join(' • ')
      break
    }
    default: {
      summary = [
        `${branchCount} branch, ${trunkCount} trunk`,
        `${mixedNodeCount} mixed nodes`,
        promotionCount > 0 ? `${promotionCount} promotions visible` : 'promotions hidden',
      ].join(' • ')
      break
    }
  }

  summaryNotes.push(`Summary style: ${profile.summaryStyle}`)
  summaryNotes.push(`Explanation depth: ${profile.explanationDepth}`)
  summaryNotes.push(highlightLabel)

  if (profile.metadataDensity === 'rich') {
    summaryNotes.push(
      `Metadata density rich: including ${rawFacadeView.viewMetadata.notes.length} base notes`
    )
  } else if (profile.metadataDensity === 'minimal') {
    summaryNotes.push('Metadata density minimal: compact surface summary')
  }

  return { summary, summaryNotes }
}
