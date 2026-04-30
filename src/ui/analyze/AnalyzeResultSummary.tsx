import type { AnalyzeResultSummaryViewModel } from '../viewModels/buildAnalyzeResultSummaryViewModel'
import type { PrimaryTabId } from '../navigation/tabUiTypes'
import { ResultDeltaBadge } from '../shared/ResultDeltaBadge'
import { RecommendedTabButton } from '../shared/RecommendedTabButton'

type AnalyzeResultSummaryProps = {
  viewModel: AnalyzeResultSummaryViewModel
  researchMode?: boolean
  onTabChange: (tabId: PrimaryTabId) => void
}

export const AnalyzeResultSummary = ({
  viewModel,
  researchMode = false,
  onTabChange,
}: AnalyzeResultSummaryProps) => {
  if (!viewModel.hasResult) return null

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <p className="mb-1 text-sm font-bold text-emerald-800">{viewModel.headline}</p>
      <p className="mb-3 text-xs leading-relaxed text-emerald-700">{viewModel.summaryText}</p>
      <div className="flex flex-wrap gap-2">
        {viewModel.deltas.map((delta) => (
          <ResultDeltaBadge
            key={delta.id}
            label={delta.label}
            tone={delta.tone}
          />
        ))}
      </div>
      {researchMode ? (
        <div className="mt-3 border-t border-emerald-200 pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">Raw deltas</p>
          <div className="flex flex-wrap gap-2">
            {viewModel.deltas.map((delta) => (
              <span key={`raw-${delta.id}`} className="font-mono text-[11px] text-emerald-700">
                {delta.id}: {delta.value}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {viewModel.recommendedTabs.length > 0 ? (
        <div className="mt-3 border-t border-emerald-200 pt-3">
          <p className="mb-2 text-xs font-semibold text-emerald-700">次に見るとよい場所</p>
          <div className="flex flex-col gap-2">
            {viewModel.recommendedTabs.map((tab) => (
              <RecommendedTabButton
                key={tab.tabId}
                tabId={tab.tabId}
                label={tab.label}
                reason={tab.reason}
                onClick={onTabChange}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
