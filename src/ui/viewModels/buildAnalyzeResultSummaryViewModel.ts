import type { ObservationRecord } from '../../types/experience'
import type { PrimaryTabId } from '../navigation/tabUiTypes'

export type ResultDelta = {
  id: string
  label: string
  value: string
  tone: 'neutral' | 'good' | 'warning'
}

export type RecommendedTab = {
  tabId: PrimaryTabId
  label: string
  reason: string
}

export type AnalyzeResultSummaryViewModel = {
  hasResult: boolean
  headline: string
  summaryText: string
  deltas: ResultDelta[]
  stageChanged: boolean
  riskChanged: boolean
  recommendedTabs: RecommendedTab[]
}

type BuildAnalyzeResultSummaryViewModelInput = {
  currentObservation: ObservationRecord | null
  previousObservation: ObservationRecord | null
}

const getRiskLevel = (obs: ObservationRecord | null): 'low' | 'medium' | 'high' => {
  return obs?.signalOverviewSource?.riskReport?.riskLevel ?? 'low'
}

const getStage = (obs: ObservationRecord | null): number => {
  return obs?.signalOverviewSource?.developmentStage?.stage ?? 1
}

const getAssemblyCount = (obs: ObservationRecord | null): number => {
  return obs?.signalOverviewSource?.observeSummary?.branch?.assemblyCount ?? 0
}

const getBridgeCount = (obs: ObservationRecord | null): number => {
  return obs?.signalOverviewSource?.observeSummary?.branch?.bridgeCount ?? 0
}

const getProtoSeedCount = (obs: ObservationRecord | null): number => {
  return obs?.signalOverviewSource?.observeSummary?.branch?.protoSeedCount ?? 0
}

const getTeacherDependency = (obs: ObservationRecord | null): number => {
  return obs?.signalOverviewSource?.observeSummary?.branch?.averageTeacherDependency ?? 0
}

const formatDelta = (delta: number, unit = ''): string => {
  if (delta === 0) return `変化なし`
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}${unit}`
}

export const buildAnalyzeResultSummaryViewModel = ({
  currentObservation,
  previousObservation,
}: BuildAnalyzeResultSummaryViewModelInput): AnalyzeResultSummaryViewModel => {
  if (!currentObservation) {
    return {
      hasResult: false,
      headline: '',
      summaryText: '',
      deltas: [],
      stageChanged: false,
      riskChanged: false,
      recommendedTabs: [],
    }
  }

  const assemblyDelta = getAssemblyCount(currentObservation) - getAssemblyCount(previousObservation)
  const bridgeDelta = getBridgeCount(currentObservation) - getBridgeCount(previousObservation)
  const protoSeedDelta = getProtoSeedCount(currentObservation) - getProtoSeedCount(previousObservation)
  const teacherDependencyDelta = getTeacherDependency(currentObservation) - getTeacherDependency(previousObservation)
  const currentRisk = getRiskLevel(currentObservation)
  const previousRisk = getRiskLevel(previousObservation)
  const currentStage = getStage(currentObservation)
  const previousStage = getStage(previousObservation)
  const stageChanged = currentStage !== previousStage
  const riskChanged = currentRisk !== previousRisk
  const activeParticleCount = getAssemblyCount(currentObservation)
  const hasScenarioResult = Boolean(currentObservation?.signalOverviewSource)

  const deltas: ResultDelta[] = [
    {
      id: 'assembly',
      label: assemblyDelta !== 0 ? `点群 ${formatDelta(assemblyDelta)}` : '点群 変化なし',
      value: formatDelta(assemblyDelta),
      tone: assemblyDelta > 0 ? 'good' : 'neutral',
    },
    {
      id: 'bridge',
      label: bridgeDelta !== 0 ? `結びつき ${formatDelta(bridgeDelta)}` : '結びつき 変化なし',
      value: formatDelta(bridgeDelta),
      tone: bridgeDelta > 0 ? 'good' : 'neutral',
    },
    {
      id: 'protoseed',
      label: protoSeedDelta !== 0 ? `意味の種 ${formatDelta(protoSeedDelta)}` : '意味の種 変化なし',
      value: formatDelta(protoSeedDelta),
      tone: protoSeedDelta > 0 ? 'good' : 'neutral',
    },
    {
      id: 'risk',
      label: riskChanged ? `リスク → ${currentRisk}` : 'リスク変化なし',
      value: currentRisk,
      tone: currentRisk === 'low' ? 'good' : currentRisk === 'medium' ? 'warning' : 'warning',
    },
    {
      id: 'stage',
      label: stageChanged ? `段階 → Stage ${currentStage}` : '段階変化なし',
      value: stageChanged ? `Stage ${currentStage}` : '変化なし',
      tone: stageChanged ? 'good' : 'neutral',
    },
  ]

  if (Math.abs(teacherDependencyDelta) > 0.01) {
    const teacherDeltaFormatted = `${teacherDependencyDelta > 0 ? '+' : ''}${(teacherDependencyDelta * 100).toFixed(0)}%`
    deltas.push({
      id: 'teacher',
      label: `先生依存 ${teacherDeltaFormatted}`,
      value: teacherDeltaFormatted,
      tone: teacherDependencyDelta < 0 ? 'good' : 'warning',
    })
  }

  const hasGrowth = assemblyDelta > 0 || bridgeDelta > 0 || protoSeedDelta > 0
  const hasIgnition = activeParticleCount > 0

  let headline = '今回の観察結果'
  let summaryText: string

  if (hasGrowth) {
    summaryText = `発火が記録され、assembly や bridge が増えました。成長タブで変化を確認できます。`
  } else if (hasIgnition) {
    summaryText = `baseline が作られました。今回はまだ assembly は増えていませんが、同じテーマを何度か観察すると、繰り返し発火する点群が見え始めます。`
  } else {
    summaryText = `観察が完了しました。まだ assembly は増えていません。baseline として記録されました。`
  }

  if (!currentObservation.signalOverviewSource) {
    headline = '観察完了'
    summaryText = summaryText.includes('baseline')
      ? summaryText
      : 'Legacy / LLM モードで観察が完了しました。詳細は各タブで確認できます。'
  }

  // Recommended tabs
  const recommendedTabs: RecommendedTab[] = []

  if (activeParticleCount > 0 && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'field',
      label: '発火を見る',
      reason: '今回の入力でどの点群が反応したか見られます。',
    })
  }

  if ((assemblyDelta > 0 || bridgeDelta > 0 || protoSeedDelta > 0) && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'growth',
      label: '成長を見る',
      reason: 'assembly / bridge の変化を確認できます。',
    })
  }

  if (Math.abs(teacherDependencyDelta) > 0.01 && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'teacher',
      label: '先生を見る',
      reason: 'teacher dependency の変化を確認できます。',
    })
  }

  if (currentRisk !== 'low' && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'risk',
      label: 'リスクを見る',
      reason: 'リスクレベルが上昇しています。',
    })
  }

  if (stageChanged && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'overview',
      label: '概要を見る',
      reason: '発達段階が変化しました。',
    })
  }

  if (hasScenarioResult && recommendedTabs.length < 3) {
    recommendedTabs.push({
      tabId: 'evaluate',
      label: '検証を見る',
      reason: 'シナリオ評価結果を確認できます。',
    })
  }

  // fallback: always suggest field if no recommendations yet
  if (recommendedTabs.length === 0) {
    recommendedTabs.push({
      tabId: 'field',
      label: '発火を見る',
      reason: '点群の反応を確認できます。',
    })
  }

  return {
    hasResult: true,
    headline,
    summaryText,
    deltas,
    stageChanged,
    riskChanged,
    recommendedTabs: recommendedTabs.slice(0, 3),
  }
}
