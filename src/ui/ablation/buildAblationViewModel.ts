import type { SignalAblationConfig, SignalAblationComparison, SignalAblationRunSummary } from '../../signalAblation/signalAblationTypes'

export type AblationFeatureEntry = {
  key: keyof SignalAblationConfig
  label: string
  description: string
  enabled: boolean
}

export type AblationMetricDiff = {
  label: string
  diff: number
  goodDirection: 'up' | 'down'
  formatted: string
}

export type AblationComparisonViewModel = {
  disabledFeatures: string[]
  assemblyGrowthDiff: number
  bridgeGrowthDiff: number
  recallSuccessDiff: number
  teacherDependencyDiff: number
  overbindingRiskDiff: number
  promotionReadinessDiff: number
  notes: string[]
  metricDiffs: AblationMetricDiff[]
  interpretation: string
}

export type AblationConfigViewModel = {
  features: AblationFeatureEntry[]
}

const FEATURE_META: Record<keyof SignalAblationConfig, { label: string; description: string }> = {
  teacherEnabled: { label: 'Teacher', description: 'same-object 補助輪' },
  inhibitionEnabled: { label: 'Inhibition', description: '過結合防止' },
  dreamEnabled: { label: 'Dream', description: '休止中の仮説再結合' },
  rewardEnabled: { label: 'Reward', description: '強化学習シグナル' },
  modulatorEnabled: { label: 'Modulator', description: '学習速度調整' },
  sequenceMemoryEnabled: { label: 'Sequence Memory', description: '時系列記憶' },
  contrastLearningEnabled: { label: 'Contrast Learning', description: '類似差異学習' },
  consolidationEnabled: { label: 'Consolidation', description: '睡眠期の記憶強化' },
}

const formatDiff = (value: number): string => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

const buildInterpretation = (comparison: SignalAblationComparison): string => {
  if (comparison.notes.length > 0) {
    return comparison.notes.join(' / ')
  }

  const effects: string[] = []
  if (Math.abs(comparison.metricDiff.overbindingRiskDiff) > 0.1) {
    effects.push(comparison.metricDiff.overbindingRiskDiff > 0
      ? '過結合リスクが上昇しました'
      : '過結合リスクが低下しました')
  }
  if (Math.abs(comparison.metricDiff.recallSuccessDiff) > 0.05) {
    effects.push(comparison.metricDiff.recallSuccessDiff > 0
      ? 'Recall 成功率が向上しました'
      : 'Recall 成功率が低下しました')
  }
  if (effects.length === 0) {
    effects.push('有意な差は観察されませんでした')
  }
  return effects.join('。')
}

export const buildAblationConfigViewModel = (config: SignalAblationConfig): AblationConfigViewModel => ({
  features: (Object.keys(config) as (keyof SignalAblationConfig)[]).map((key) => ({
    key,
    label: FEATURE_META[key].label,
    description: FEATURE_META[key].description,
    enabled: config[key],
  })),
})

export const buildAblationComparisonViewModel = (
  comparison: SignalAblationComparison,
): AblationComparisonViewModel => ({
  disabledFeatures: comparison.disabledFeatures,
  assemblyGrowthDiff: comparison.metricDiff.assemblyGrowthDiff,
  bridgeGrowthDiff: comparison.metricDiff.bridgeGrowthDiff,
  recallSuccessDiff: comparison.metricDiff.recallSuccessDiff,
  teacherDependencyDiff: comparison.metricDiff.teacherDependencyDiff,
  overbindingRiskDiff: comparison.metricDiff.overbindingRiskDiff,
  promotionReadinessDiff: comparison.metricDiff.promotionReadinessDiff,
  notes: comparison.notes,
  interpretation: buildInterpretation(comparison),
  metricDiffs: [
    { label: 'Assembly Growth', diff: comparison.metricDiff.assemblyGrowthDiff, goodDirection: 'up', formatted: formatDiff(comparison.metricDiff.assemblyGrowthDiff) },
    { label: 'Bridge Growth', diff: comparison.metricDiff.bridgeGrowthDiff, goodDirection: 'up', formatted: formatDiff(comparison.metricDiff.bridgeGrowthDiff) },
    { label: 'Recall Success', diff: comparison.metricDiff.recallSuccessDiff, goodDirection: 'up', formatted: formatDiff(comparison.metricDiff.recallSuccessDiff) },
    { label: 'Teacher Dependency', diff: comparison.metricDiff.teacherDependencyDiff, goodDirection: 'down', formatted: formatDiff(comparison.metricDiff.teacherDependencyDiff) },
    { label: 'Overbinding Risk', diff: comparison.metricDiff.overbindingRiskDiff, goodDirection: 'down', formatted: formatDiff(comparison.metricDiff.overbindingRiskDiff) },
    { label: 'Promotion Readiness', diff: comparison.metricDiff.promotionReadinessDiff, goodDirection: 'up', formatted: formatDiff(comparison.metricDiff.promotionReadinessDiff) },
  ],
})

export const buildAblationRunSummaryLabel = (summary: SignalAblationRunSummary): string => {
  if (summary.disabledFeatures.length === 0) return 'Baseline (all features enabled)'
  return `Disabled: ${summary.disabledFeatures.join(', ')}`
}
