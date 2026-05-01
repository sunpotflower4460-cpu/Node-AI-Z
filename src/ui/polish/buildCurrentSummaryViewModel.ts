/**
 * CurrentSummaryViewModel — data shape for CurrentSummaryCard.
 */
export type CurrentSummaryViewModel = {
  title: string
  subtitle: string
  engineLabel: string
  stageLabel: string
  riskLabel: string
  growthSummary: string
  nextAction: string
  details?: Array<{
    label: string
    value: string
  }>
}

type BuildCurrentSummaryViewModelInput = {
  engineLabel: string
  stageLabel: string
  riskLevel: 'low' | 'medium' | 'high'
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  hasObservation: boolean
  snapshotLabel?: string
  detailMode: 'simple' | 'research'
}

const RISK_LABEL_JA: Record<'low' | 'medium' | 'high', string> = {
  low: '落ち着いています',
  medium: '少し注意',
  high: '要確認',
}

export const buildCurrentSummaryViewModel = ({
  engineLabel,
  stageLabel,
  riskLevel,
  assemblyCount,
  bridgeCount,
  protoSeedCount,
  hasObservation,
  snapshotLabel,
  detailMode,
}: BuildCurrentSummaryViewModelInput): CurrentSummaryViewModel => {
  const hasGrowth = assemblyCount > 0 || bridgeCount > 0 || protoSeedCount > 0

  const growthSummary = hasGrowth
    ? `点群 ${assemblyCount} / 結びつき ${bridgeCount} / 意味の種 ${protoSeedCount}`
    : '点群 0 / 結びつき 0 / 意味の種 0'

  const nextAction = hasObservation
    ? hasGrowth
      ? '発火・成長タブで詳しく見てください。'
      : '同じ刺激を繰り返し Analyze して成長を促してください。'
    : 'まず文章を入力して Analyze してください。'

  const subtitle = `${engineLabel} / ${stageLabel}`

  const details =
    detailMode === 'research'
      ? [
          { label: 'engine', value: engineLabel },
          { label: 'stage', value: stageLabel },
          { label: 'riskLevel', value: riskLevel },
          { label: 'snapshot', value: snapshotLabel ?? 'none' },
        ]
      : undefined

  return {
    title: '現在の状態',
    subtitle,
    engineLabel,
    stageLabel,
    riskLabel: RISK_LABEL_JA[riskLevel],
    growthSummary,
    nextAction,
    details,
  }
}
