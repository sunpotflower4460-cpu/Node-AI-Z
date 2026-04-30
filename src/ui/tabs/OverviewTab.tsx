import type { OverviewMode, UiDetailMode } from '../mode/modeUiTypes'
import type { ObservationRecord, ImplementationMode } from '../../types/experience'
import { buildSignalOverviewViewModel } from '../overview/buildSignalOverviewViewModel'
import { buildCompactMetricsViewModel } from '../viewModels/buildCompactMetricsViewModel'
import { CurrentModeCard } from '../overview/CurrentModeCard'
import { DevelopmentStageCard } from '../development/DevelopmentStageCard'
import { RiskSummaryCard } from '../overview/RiskSummaryCard'
import { NextActionCard } from '../overview/NextActionCard'
import { EngineSelectorCompact } from '../mode/EngineSelectorCompact'
import { CompactMetricStrip } from '../shared/CompactMetricStrip'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { TabEmptyState } from '../shared/TabEmptyState'

type OverviewTabProps = {
  observation: ObservationRecord | null
  selectedMode: OverviewMode
  detailMode: UiDetailMode
  implementationMode: ImplementationMode
  onModeChange: (mode: OverviewMode) => void
  onDetailModeChange: (mode: UiDetailMode) => void
}

export const OverviewTab = ({
  observation,
  selectedMode,
  detailMode,
  implementationMode,
  onModeChange,
}: Omit<OverviewTabProps, 'onDetailModeChange'> & { onDetailModeChange?: (mode: UiDetailMode) => void }) => {
  const activeMode = implementationMode === 'llm_mode' ? 'llm_mode' : selectedMode
  const viewModel = buildSignalOverviewViewModel({ mode: activeMode, observation })
  const isResearch = detailMode === 'research'

  const hasObservation = observation !== null
  const hasGrowthData =
    viewModel.growth.assemblyCount > 0 ||
    viewModel.growth.bridgeCount > 0 ||
    viewModel.growth.protoSeedCount > 0

  const compactMetrics = buildCompactMetricsViewModel({
    assemblyCount: viewModel.growth.assemblyCount,
    bridgeCount: viewModel.growth.bridgeCount,
    protoSeedCount: viewModel.growth.protoSeedCount,
    recallSuccessRate: viewModel.growth.recallSuccessRate,
    averageTeacherDependency: viewModel.growth.averageTeacherDependency,
  })

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Overview' : '概要'}
        description={
          isResearch
            ? 'Current location, development stage, growth summary, and next recommended action.'
            : '現在地・発達段階・成長要約・次のおすすめを確認します。'
        }
      />

      <EngineSelectorCompact
        selectedEngine={activeMode}
        onChange={onModeChange}
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <CurrentModeCard viewModel={viewModel} />
        <DevelopmentStageCard
          development={viewModel.development}
          researchMode={isResearch}
        />
      </div>

      {hasObservation && hasGrowthData ? (
        <CompactMetricStrip
          metrics={compactMetrics}
          researchMode={isResearch}
          columns={3}
        />
      ) : (
        <TabEmptyState
          title={isResearch ? 'No growth data yet' : 'まだ成長データはありません'}
          description={
            isResearch
              ? 'Run Analyze to create the first growth snapshot.'
              : 'まず Analyze して baseline を作ってください。'
          }
          nextAction={isResearch ? 'Run Analyze to start' : 'Analyze して現在地を作る'}
        />
      )}

      <RiskSummaryCard risk={viewModel.risk} detailMode={detailMode} />

      <NextActionCard nextActions={viewModel.nextActions} />
    </div>
  )
}
