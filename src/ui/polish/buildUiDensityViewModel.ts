/**
 * UiDensityViewModel — describes how much detail to show based on app state.
 * Used by MetricDensityController to decide which components to render.
 */
export type UiDensityViewModel = {
  hasObservation: boolean
  hasGrowthData: boolean
  detailMode: 'simple' | 'research'
  shouldShowHeroCards: boolean
  shouldShowCompactMetrics: boolean
  shouldCollapseDetails: boolean
  shouldShowRawMetrics: boolean
}

type BuildUiDensityViewModelInput = {
  hasObservation: boolean
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  detailMode: 'simple' | 'research'
}

export const buildUiDensityViewModel = ({
  hasObservation,
  assemblyCount,
  bridgeCount,
  protoSeedCount,
  detailMode,
}: BuildUiDensityViewModelInput): UiDensityViewModel => {
  const hasGrowthData = assemblyCount > 0 || bridgeCount > 0 || protoSeedCount > 0
  const isResearch = detailMode === 'research'

  return {
    hasObservation,
    hasGrowthData,
    detailMode,
    shouldShowHeroCards: true,
    shouldShowCompactMetrics: hasObservation && hasGrowthData,
    shouldCollapseDetails: !isResearch,
    shouldShowRawMetrics: isResearch,
  }
}
