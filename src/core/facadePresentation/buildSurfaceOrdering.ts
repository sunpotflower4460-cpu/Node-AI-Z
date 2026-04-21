import type { FacadeView } from '../facadeRuntime/facadeRuntimeTypes'
import type { PresentationBiasProfile } from './surfaceTranslatorTypes'

export type SurfaceOrderingResult = {
  sectionOrder: string[]
  orderingNotes: string[]
}

export const buildSurfaceOrdering = (
  rawFacadeView: FacadeView,
  profile: PresentationBiasProfile
): SurfaceOrderingResult => {
  const orderingNotes: string[] = []

  const orderingByProfile: Record<
    PresentationBiasProfile['ordering'],
    string[]
  > = {
    branch_first: [
      'branch',
      'trunk',
      'promotion',
      'guardian',
      'persistence',
    ],
    trunk_first: [
      'trunk',
      'branch',
      'promotion',
      'guardian',
      'persistence',
    ],
    review_first: [
      'promotion',
      'guardian',
      'persistence',
      'branch',
      'trunk',
    ],
    persistence_first: [
      'persistence',
      'guardian',
      'promotion',
      'trunk',
      'branch',
    ],
  }

  const sectionOrder = orderingByProfile[profile.ordering]

  orderingNotes.push(`Ordering preference: ${profile.ordering}`)
  orderingNotes.push(
    `Schemas visible (branch/trunk): ${rawFacadeView.visibleSchemas.filter((s) => s.origin === 'personal_branch').length}/${rawFacadeView.visibleSchemas.filter((s) => s.origin === 'shared_trunk').length}`
  )

  if (rawFacadeView.promotionCandidates?.length) {
    orderingNotes.push(`Promotion candidates: ${rawFacadeView.promotionCandidates.length}`)
  }

  return {
    sectionOrder,
    orderingNotes,
  }
}
