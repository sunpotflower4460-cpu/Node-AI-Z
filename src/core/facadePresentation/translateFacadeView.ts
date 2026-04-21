import type { FacadeView } from '../facadeRuntime/facadeRuntimeTypes'
import { buildSurfaceHighlights } from './buildSurfaceHighlights'
import { buildSurfaceOrdering } from './buildSurfaceOrdering'
import { buildSurfaceSummary } from './buildSurfaceSummary'
import type {
  SurfaceTranslationInput,
  SurfaceTranslationOutput,
} from './surfaceTranslatorTypes'

const mapOriginToSection = (origin: FacadeView['visibleSchemas'][number]['origin']) => {
  if (origin === 'personal_branch') return 'branch'
  if (origin === 'shared_trunk') return 'trunk'
  return 'app_facade'
}

const applyOrderingToSchemas = (
  schemas: FacadeView['visibleSchemas'],
  sectionOrder: string[]
) => {
  const priority = (schemaSection: string) => {
    const index = sectionOrder.indexOf(schemaSection)
    return index >= 0 ? index : sectionOrder.length + 1
  }

  return [...schemas].sort((first, second) => {
    return priority(mapOriginToSection(first.origin)) - priority(mapOriginToSection(second.origin))
  })
}

const applyOrderingToMixedNodes = (
  nodes: FacadeView['visibleMixedNodes'],
  sectionOrder: string[]
) => {
  const priority = (nodeSection: string) => {
    const index = sectionOrder.indexOf(nodeSection)
    return index >= 0 ? index : sectionOrder.length + 1
  }

  return [...nodes].sort((first, second) => {
    return priority(mapOriginToSection(first.origin)) - priority(mapOriginToSection(second.origin))
  })
}

const mergeMetadataNotes = (
  baseNotes: string[],
  translationNotes: string[],
  metadataDensity: 'minimal' | 'balanced' | 'rich'
) => {
  if (metadataDensity === 'minimal') {
    return [...baseNotes, ...translationNotes.slice(0, 2)]
  }
  if (metadataDensity === 'balanced') {
    return [...baseNotes, ...translationNotes.slice(0, 4)]
  }
  return [...baseNotes, ...translationNotes]
}

export const translateFacadeView = (
  input: SurfaceTranslationInput
): SurfaceTranslationOutput => {
  const { rawFacadeView, profile } = input

  const highlightResult = buildSurfaceHighlights(rawFacadeView, profile)
  const orderingResult = buildSurfaceOrdering(rawFacadeView, profile)
  const summaryResult = buildSurfaceSummary(
    rawFacadeView,
    highlightResult.highlightKeys,
    profile
  )

  const translationNotes = [
    `Presentation bias for ${profile.mode}`,
    `Ordering: ${orderingResult.sectionOrder.join(' > ')}`,
    `Summary style: ${profile.summaryStyle}`,
    ...highlightResult.notes,
    ...orderingResult.orderingNotes,
    ...summaryResult.summaryNotes,
  ]

  const translatedFacadeView: FacadeView = {
    ...rawFacadeView,
    visibleSchemas: applyOrderingToSchemas(
      rawFacadeView.visibleSchemas,
      orderingResult.sectionOrder
    ),
    visibleMixedNodes: applyOrderingToMixedNodes(
      rawFacadeView.visibleMixedNodes,
      orderingResult.sectionOrder
    ),
    viewMetadata: {
      ...rawFacadeView.viewMetadata,
      notes: mergeMetadataNotes(
        rawFacadeView.viewMetadata.notes,
        translationNotes,
        profile.metadataDensity
      ),
    },
    surfacePresentation: {
      summary: summaryResult.summary,
      summaryStyle: profile.summaryStyle,
      explanationDepth: profile.explanationDepth,
      metadataDensity: profile.metadataDensity,
      ordering: orderingResult.sectionOrder,
      highlightKeys: highlightResult.highlightKeys,
      notes: translationNotes,
      biasProfileMode: profile.mode,
    },
  }

  return {
    translatedFacadeView,
    highlightKeys: highlightResult.highlightKeys,
    orderingNotes: orderingResult.orderingNotes,
    summaryNotes: summaryResult.summaryNotes,
  }
}
