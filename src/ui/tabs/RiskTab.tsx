import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildRiskViewModel, buildEmptyRiskViewModel } from '../risk/buildRiskViewModel'
import { RiskSummaryHeader } from '../risk/RiskSummaryHeader'
import { RiskWarningsPanel } from '../risk/RiskWarningsPanel'
import { RiskRecommendedActions } from '../risk/RiskRecommendedActions'
import { DetailAccordion } from '../shared/DetailAccordion'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'

type RiskTabProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

const RISK_LABEL_JA: Record<string, string> = {
  Overbinding: '過結合',
  'False Binding': '誤結合',
  'Teacher Overtrust': '先生過信',
  'Dream Noise': '夢ノイズ',
}

export const RiskTab = ({ source, detailMode }: RiskTabProps) => {
  const isResearch = detailMode === 'research'
  const viewModel = source
    ? buildRiskViewModel(source.riskReport)
    : buildEmptyRiskViewModel()

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Risk' : 'リスク'}
        description={
          isResearch
            ? 'Monitor overbinding, false binding, teacher overtrust, and dream noise risks.'
            : '過結合・誤結合・先生過信・夢ノイズのリスクを確認します。'
        }
      />

      <RiskSummaryHeader viewModel={viewModel} />

      {/* Compact risk summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {viewModel.cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border px-3 py-2.5 text-center ${
              card.level === 'low'
                ? 'border-emerald-200 bg-emerald-50'
                : card.level === 'medium'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-red-200 bg-red-50'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isResearch ? card.label : (RISK_LABEL_JA[card.label] ?? card.label)}
            </p>
            <p
              className={`mt-1 text-sm font-extrabold ${
                card.level === 'low'
                  ? 'text-emerald-700'
                  : card.level === 'medium'
                    ? 'text-amber-700'
                    : 'text-red-700'
              }`}
            >
              {card.level.charAt(0).toUpperCase() + card.level.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <RiskWarningsPanel warnings={viewModel.warnings} />

      <RiskRecommendedActions actions={viewModel.recommendedActions} />

      {isResearch ? (
        <DetailAccordion summary="Raw Risk Scores">
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
        </DetailAccordion>
      ) : null}
    </div>
  )
}
