import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildRiskViewModel, buildEmptyRiskViewModel } from './buildRiskViewModel'
import { RiskSummaryHeader } from './RiskSummaryHeader'
import { RiskBreakdownCards } from './RiskBreakdownCards'
import { RiskWarningsPanel } from './RiskWarningsPanel'
import { RiskRecommendedActions } from './RiskRecommendedActions'
import { SectionHeader } from '../shared/SectionHeader'

type RiskViewProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const RiskView = ({ source, detailMode }: RiskViewProps) => {
  const viewModel = source
    ? buildRiskViewModel(source.riskReport)
    : buildEmptyRiskViewModel()

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Risk View"
        description="危険な育ち方をしていないか確認します。"
        badge={
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            New Signal Mode
          </span>
        }
      />

      <RiskSummaryHeader viewModel={viewModel} />

      <RiskBreakdownCards cards={viewModel.cards} />

      <RiskWarningsPanel warnings={viewModel.warnings} />

      <RiskRecommendedActions actions={viewModel.recommendedActions} />

      {detailMode === 'research' ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Raw Risk Scores</p>
          <div className="grid gap-2 sm:grid-cols-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between rounded-lg bg-white px-3 py-2">
              <span>overbindingRisk</span>
              <span className="font-bold text-slate-800">{viewModel.overbindingRisk.toFixed(3)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-white px-3 py-2">
              <span>falseBindingRisk</span>
              <span className="font-bold text-slate-800">{viewModel.falseBindingRisk.toFixed(3)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-white px-3 py-2">
              <span>teacherOvertrustRisk</span>
              <span className="font-bold text-slate-800">{viewModel.teacherOvertrustRisk.toFixed(3)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-white px-3 py-2">
              <span>dreamNoiseRisk</span>
              <span className="font-bold text-slate-800">{viewModel.dreamNoiseRisk.toFixed(3)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
