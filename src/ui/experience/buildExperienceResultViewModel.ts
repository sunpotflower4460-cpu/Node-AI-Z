import type { ExperienceMessage } from '../../types/experience'

export type ObserveTab = 'overview' | 'field' | 'growth' | 'teacher' | 'risk' | 'history'

export type RecommendedObserveLink = {
  label: string
  targetMode: 'observe'
  targetTab: ObserveTab
  reason: string
}

export type ExperienceResultViewModel = {
  responseText: string
  engineLabel: string
  internalSummary: string
  recommendedObserveLinks: RecommendedObserveLink[]
}

type BuildExperienceResultViewModelInput = {
  message: ExperienceMessage
  engineLabel: string
}

export const buildExperienceResultViewModel = (
  input: BuildExperienceResultViewModelInput,
): ExperienceResultViewModel => {
  const { message, engineLabel } = input
  const links: RecommendedObserveLink[] = []

  const hasSignal = message.runtimeMode === 'signal' || message.signalResult !== undefined
  const hasGrowth = (message.signalResult?.protoMeanings?.length ?? 0) > 0
  const hasRisk = message.signalOverviewSource?.riskReport?.riskLevel === 'high'

  if (hasSignal) {
    links.push({
      label: '発火を見る',
      targetMode: 'observe',
      targetTab: 'field',
      reason: 'Signal Runtime で発火が記録されました',
    })
  }

  if (hasGrowth) {
    links.push({
      label: '成長を見る',
      targetMode: 'observe',
      targetTab: 'growth',
      reason: 'ProtoMeaning が更新されました',
    })
  }

  if (hasRisk) {
    links.push({
      label: 'リスクを見る',
      targetMode: 'observe',
      targetTab: 'risk',
      reason: 'リスクスコアが上昇しています',
    })
  }

  if (links.length === 0) {
    links.push({
      label: '観察モードで詳しく見る',
      targetMode: 'observe',
      targetTab: 'overview',
      reason: '今回の反応の内部状態を確認できます',
    })
  }

  return {
    responseText: message.text,
    engineLabel,
    internalSummary: hasSignal
      ? 'New Signal Mode の観察も更新されました。'
      : '裏側では内部観察が更新されました。',
    recommendedObserveLinks: links,
  }
}
