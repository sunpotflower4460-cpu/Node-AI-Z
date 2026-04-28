import type { AblationComparisonViewModel } from './buildAblationViewModel'
import { AblationMetricDiffCards } from './AblationMetricDiffCards'

type AblationComparisonPanelProps = {
  comparison: AblationComparisonViewModel
}

export const AblationComparisonPanel = ({ comparison }: AblationComparisonPanelProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-600">Disabled:</span>
      {comparison.disabledFeatures.length > 0 ? (
        comparison.disabledFeatures.map((feature) => (
          <span
            key={feature}
            className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700"
          >
            {feature}
          </span>
        ))
      ) : (
        <span className="text-[11px] text-slate-400">なし (baseline)</span>
      )}
    </div>
    <AblationMetricDiffCards diffs={comparison.metricDiffs} />
    {comparison.interpretation ? (
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interpretation</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">{comparison.interpretation}</p>
      </div>
    ) : null}
    {comparison.notes.length > 0 ? (
      <ul className="mt-3 space-y-1">
        {comparison.notes.map((note) => (
          <li key={note} className="text-[11px] leading-relaxed text-slate-500">· {note}</li>
        ))}
      </ul>
    ) : null}
  </div>
)
