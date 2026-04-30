import type { OverviewMode } from '../mode/modeUiTypes'
import { getEngineLabel } from '../mode/engineLabelMap'

export type FirstScreenViewModel = {
  screenMode: 'observe' | 'experience'
  engine: OverviewMode
  engineLabel: string
  stageLabel: string
  riskLabel: 'Low' | 'Medium' | 'High'
  snapshotLabel: string
  hasObservation: boolean
  primaryInstruction: string
  shouldShowEmptyState: boolean
  shouldShowCompactMetrics: boolean
}

type BuildFirstScreenViewModelInput = {
  screenMode: 'observe' | 'experience'
  engine: OverviewMode
  stageLabel: string
  riskLevel: 'low' | 'medium' | 'high'
  hasSnapshot: boolean
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  hasObservation: boolean
}

const RISK_LABEL_MAP: Record<'low' | 'medium' | 'high', 'Low' | 'Medium' | 'High'> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const buildFirstScreenViewModel = ({
  screenMode,
  engine,
  stageLabel,
  riskLevel,
  hasSnapshot,
  assemblyCount,
  bridgeCount,
  protoSeedCount,
  hasObservation,
}: BuildFirstScreenViewModelInput): FirstScreenViewModel => {
  const isEmpty = assemblyCount === 0 && bridgeCount === 0 && protoSeedCount === 0 && !hasObservation

  return {
    screenMode,
    engine,
    engineLabel: getEngineLabel(engine).full,
    stageLabel,
    riskLabel: RISK_LABEL_MAP[riskLevel],
    snapshotLabel: hasSnapshot ? '保存あり' : '保存なし',
    hasObservation,
    primaryInstruction: isEmpty
      ? 'テキストを入力して Analyze すると、Signal Mode の発火・成長・リスクが表示されます。'
      : '観察結果が記録されています。タブで詳細を確認できます。',
    shouldShowEmptyState: isEmpty,
    shouldShowCompactMetrics: hasObservation,
  }
}
