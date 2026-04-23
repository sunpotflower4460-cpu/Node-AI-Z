import type { AppFacadeMode } from '../coreTypes'
import type { PresentationBiasProfile } from './surfaceTranslatorTypes'

const crystallizedThinkingProfile: PresentationBiasProfile = {
  mode: 'crystallized_thinking',
  emphasis: {
    branch: 1.0,
    trunk: 0.35,
    promotion: 0.25,
    guardian: 0.2,
    persistence: 0.2,
  },
  explanationDepth: 'deep',
  metadataDensity: 'balanced',
  ordering: 'branch_first',
  summaryStyle: 'thinking',
  highlightTopN: 6,
}

const observerProfile: PresentationBiasProfile = {
  mode: 'observer',
  emphasis: {
    branch: 0.9,
    trunk: 0.8,
    promotion: 0.9,
    guardian: 0.9,
    persistence: 0.85,
  },
  explanationDepth: 'deep',
  metadataDensity: 'rich',
  ordering: 'review_first',
  summaryStyle: 'observe',
  highlightTopN: 10,
}

const futureAppProfile: PresentationBiasProfile = {
  mode: 'future_app',
  emphasis: {
    branch: 0.85,
    trunk: 0.15,
    promotion: 0.0,
    guardian: 0.0,
    persistence: 0.1,
  },
  explanationDepth: 'minimal',
  metadataDensity: 'minimal',
  ordering: 'branch_first',
  summaryStyle: 'plain',
  highlightTopN: 3,
}

const fallbackProfile: PresentationBiasProfile = {
  mode: 'future_app',
  emphasis: {
    branch: 0.5,
    trunk: 0.5,
    promotion: 0.1,
    guardian: 0.1,
    persistence: 0.1,
  },
  explanationDepth: 'minimal',
  metadataDensity: 'balanced',
  ordering: 'branch_first',
  summaryStyle: 'plain',
  highlightTopN: 3,
}

const profileMap: Record<AppFacadeMode, PresentationBiasProfile> = {
  crystallized_thinking: crystallizedThinkingProfile,
  observer: observerProfile,
  future_app: futureAppProfile,
  llm_mode: fallbackProfile,
}

export const getPresentationBiasProfile = (mode: AppFacadeMode): PresentationBiasProfile => {
  if (mode === 'llm_mode') {
    return { ...fallbackProfile, mode: 'llm_mode' }
  }
  if (profileMap[mode]) return profileMap[mode]
  return { ...fallbackProfile, mode }
}

export const listPresentationBiasProfiles = (): PresentationBiasProfile[] => {
  return Object.values(profileMap)
}
