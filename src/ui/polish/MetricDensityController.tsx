import type { ReactNode } from 'react'
import type { UiDensityViewModel } from './buildUiDensityViewModel'

/**
 * MetricDensityController — renders different content depending on observation state.
 *
 * - No observation: show emptySlot only
 * - Observation, no growth: show postAnalyzeSlot
 * - Growth data: show compactMetricsSlot
 * - Research View: also show researchSlot
 */
type MetricDensityControllerProps = {
  density: UiDensityViewModel
  /** Shown before first Analyze */
  emptySlot: ReactNode
  /** Shown right after Analyze, before growth data exists */
  postAnalyzeSlot?: ReactNode
  /** Shown when growth data exists (CompactMetricStrip etc.) */
  compactMetricsSlot?: ReactNode
  /** Shown in Research View regardless of growth state */
  researchSlot?: ReactNode
}

export const MetricDensityController = ({
  density,
  emptySlot,
  postAnalyzeSlot,
  compactMetricsSlot,
  researchSlot,
}: MetricDensityControllerProps) => {
  if (!density.hasObservation) {
    return <>{emptySlot}</>
  }

  if (!density.hasGrowthData) {
    return <>{postAnalyzeSlot ?? emptySlot}</>
  }

  return (
    <>
      {density.shouldShowCompactMetrics && compactMetricsSlot ? compactMetricsSlot : null}
      {density.shouldShowRawMetrics && researchSlot ? researchSlot : null}
    </>
  )
}
