import type { AppFacadeMode } from '../coreTypes'
import type { FacadeView } from '../facadeRuntime/facadeRuntimeTypes'

export type PresentationBiasProfile = {
  mode: AppFacadeMode
  emphasis: {
    branch: number
    trunk: number
    promotion: number
    guardian: number
    persistence: number
  }
  explanationDepth: 'minimal' | 'medium' | 'deep'
  metadataDensity: 'minimal' | 'balanced' | 'rich'
  ordering: 'branch_first' | 'trunk_first' | 'review_first' | 'persistence_first'
  summaryStyle: 'plain' | 'observe' | 'thinking'
  highlightTopN: number
}

export type SurfaceTranslationInput = {
  mode: AppFacadeMode
  rawFacadeView: FacadeView
  profile: PresentationBiasProfile
}

export type SurfaceTranslationOutput = {
  translatedFacadeView: FacadeView
  highlightKeys: string[]
  orderingNotes: string[]
  summaryNotes: string[]
}
