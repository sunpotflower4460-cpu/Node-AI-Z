import type { OverviewMode } from '../mode/modeUiTypes'
import { getEngineLabel } from '../mode/engineLabelMap'

export type ExperienceModeViewModel = {
  screenMode: 'experience'
  engine: OverviewMode
  engineLabel: string
  introText: string
  hasConversation: boolean
  canSend: boolean
  helperText: string
  researchDetails?: {
    surfaceProviderLabel?: string
    internalReasoningLabel?: string
    runtimeModeLabel?: string
  }
}

type BuildExperienceModeViewModelInput = {
  engine: OverviewMode
  hasConversation: boolean
  canSend: boolean
  surfaceProviderLabel?: string
  runtimeModeLabel?: string
  internalReasoningLabel?: string
}

export const buildExperienceModeViewModel = (
  input: BuildExperienceModeViewModelInput,
): ExperienceModeViewModel => {
  const { engine, hasConversation, canSend, surfaceProviderLabel, runtimeModeLabel, internalReasoningLabel } = input
  const label = getEngineLabel(engine)

  return {
    screenMode: 'experience',
    engine,
    engineLabel: label.full,
    introText: '自然に話しながら、裏側では結晶思考の観察が積み上がります。詳しい内部状態は観察モードで確認できます。',
    hasConversation,
    canSend,
    helperText: hasConversation
      ? '続けて話してみてください。裏側の観察は観察モードで確認できます。'
      : '今考えていることを一文で入力してください。',
    researchDetails: {
      surfaceProviderLabel,
      internalReasoningLabel,
      runtimeModeLabel,
    },
  }
}
