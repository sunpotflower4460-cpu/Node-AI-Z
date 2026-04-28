import type { ObservationRecord, ImplementationMode } from '../../types/experience'
import type { OverviewMode, UiDetailMode } from '../mode/modeUiTypes'
import { buildSignalOverviewViewModel } from './buildSignalOverviewViewModel'
import { OverviewHeader } from './OverviewHeader'
import { ModeSelector } from '../mode/ModeSelector'
import { CurrentModeCard } from './CurrentModeCard'
import { DevelopmentStageCard } from '../development/DevelopmentStageCard'
import { GrowthMetricCards } from './GrowthMetricCards'
import { RiskSummaryCard } from './RiskSummaryCard'
import { NextActionCard } from './NextActionCard'

type SignalOverviewPageProps = {
  observation: ObservationRecord | null
  selectedMode: OverviewMode
  detailMode: UiDetailMode
  implementationMode: ImplementationMode
  onModeChange: (mode: OverviewMode) => void
  onDetailModeChange: (mode: UiDetailMode) => void
}

export const SignalOverviewPage = ({
  observation,
  selectedMode,
  detailMode,
  implementationMode,
  onModeChange,
  onDetailModeChange,
}: SignalOverviewPageProps) => {
  const activeMode = implementationMode === 'llm_mode' ? 'llm_mode' : selectedMode
  const viewModel = buildSignalOverviewViewModel({
    mode: activeMode,
    observation,
  })

  return (
    <div className="flex flex-col gap-4">
      <OverviewHeader viewModel={viewModel} detailMode={detailMode} onDetailModeChange={onDetailModeChange} />
      <ModeSelector selectedMode={activeMode} onChange={onModeChange} />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <CurrentModeCard viewModel={viewModel} />
        <DevelopmentStageCard development={viewModel.development} researchMode={detailMode === 'research'} />
      </div>
      <GrowthMetricCards growth={viewModel.growth} detailMode={detailMode} />
      <RiskSummaryCard risk={viewModel.risk} detailMode={detailMode} />
      <NextActionCard nextActions={viewModel.nextActions} />
    </div>
  )
}
