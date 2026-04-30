import type { OverviewMode } from '../mode/modeUiTypes'
import { getEngineLabel } from '../mode/engineLabelMap'

export type CurrentStatusViewModel = {
  engineShortLabel: string
  stageShortLabel: string
  riskShortLabel: string
  snapshotShortLabel: string
  riskLevel: 'low' | 'medium' | 'high'
}

type BuildCurrentStatusViewModelInput = {
  engine: OverviewMode
  stage: string
  riskLevel: 'low' | 'medium' | 'high'
  hasSnapshot: boolean
}

const RISK_LABEL: Record<'low' | 'medium' | 'high', string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const buildCurrentStatusViewModel = ({
  engine,
  stage,
  riskLevel,
  hasSnapshot,
}: BuildCurrentStatusViewModelInput): CurrentStatusViewModel => ({
  engineShortLabel: getEngineLabel(engine).short,
  stageShortLabel: stage,
  riskShortLabel: `Risk ${RISK_LABEL[riskLevel]}`,
  snapshotShortLabel: hasSnapshot ? '保存あり' : '保存なし',
  riskLevel,
})
