import type { ObservationRecord } from '../../types/experience'
import type { PrimaryTabId } from '../navigation/tabUiTypes'

export type PostAnalyzeAction = {
  id: string
  label: string
  tabId: PrimaryTabId
  description: string
  priority: number
}

export type PostAnalyzeNextActionsViewModel = {
  actions: PostAnalyzeAction[]
}

type BuildPostAnalyzeNextActionsViewModelInput = {
  currentObservation: ObservationRecord | null
  previousObservation: ObservationRecord | null
}

export const buildPostAnalyzeNextActionsViewModel = ({
  currentObservation,
  previousObservation,
}: BuildPostAnalyzeNextActionsViewModelInput): PostAnalyzeNextActionsViewModel => {
  if (!currentObservation) {
    return { actions: [] }
  }

  const actions: PostAnalyzeAction[] = []

  const assemblyCount = currentObservation.signalOverviewSource?.observeSummary?.branch?.assemblyCount ?? 0
  const prevAssemblyCount = previousObservation?.signalOverviewSource?.observeSummary?.branch?.assemblyCount ?? 0
  const bridgeCount = currentObservation.signalOverviewSource?.observeSummary?.branch?.bridgeCount ?? 0
  const prevBridgeCount = previousObservation?.signalOverviewSource?.observeSummary?.branch?.bridgeCount ?? 0
  const protoSeedCount = currentObservation.signalOverviewSource?.observeSummary?.branch?.protoSeedCount ?? 0
  const prevProtoSeedCount = previousObservation?.signalOverviewSource?.observeSummary?.branch?.protoSeedCount ?? 0
  const teacherDep = currentObservation.signalOverviewSource?.observeSummary?.branch?.averageTeacherDependency ?? 0
  const prevTeacherDep = previousObservation?.signalOverviewSource?.observeSummary?.branch?.averageTeacherDependency ?? 0
  const riskLevel = currentObservation.signalOverviewSource?.riskReport?.riskLevel ?? 'low'
  const currentStage = currentObservation.signalOverviewSource?.developmentStage?.stage ?? 1
  const prevStage = previousObservation?.signalOverviewSource?.developmentStage?.stage ?? 1
  const hasSignalData = Boolean(currentObservation.signalOverviewSource)

  if (assemblyCount > 0) {
    actions.push({
      id: 'field',
      label: '発火タブ',
      tabId: 'field',
      description: '今回の入力でどの点群が反応したか見られます。',
      priority: 1,
    })
  }

  if (assemblyCount > prevAssemblyCount || bridgeCount > prevBridgeCount || protoSeedCount > prevProtoSeedCount) {
    actions.push({
      id: 'growth',
      label: '成長タブ',
      tabId: 'growth',
      description: 'assembly / bridge の変化を確認できます。',
      priority: 2,
    })
  }

  if (Math.abs(teacherDep - prevTeacherDep) > 0.01) {
    actions.push({
      id: 'teacher',
      label: '先生タブ',
      tabId: 'teacher',
      description: 'teacher dependency の変化を確認できます。',
      priority: 3,
    })
  }

  if (riskLevel !== 'low') {
    actions.push({
      id: 'risk',
      label: 'リスクタブ',
      tabId: 'risk',
      description: 'リスクの詳細を確認してください。',
      priority: 4,
    })
  }

  if (currentStage !== prevStage) {
    actions.push({
      id: 'overview',
      label: '概要タブ',
      tabId: 'overview',
      description: '発達段階が変化しました。',
      priority: 5,
    })
  }

  if (hasSignalData && actions.length < 3) {
    const hasField = actions.some((a) => a.tabId === 'field')
    if (!hasField) {
      actions.push({
        id: 'field-fallback',
        label: '発火タブ',
        tabId: 'field',
        description: '点群の反応を確認できます。',
        priority: 10,
      })
    }
  }

  return {
    actions: actions.sort((a, b) => a.priority - b.priority).slice(0, 3),
  }
}
