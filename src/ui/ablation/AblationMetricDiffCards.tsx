import type { AblationMetricDiff } from './buildAblationViewModel'

type AblationMetricDiffCardsProps = {
  diffs: AblationMetricDiff[]
}

const getCardTone = (diff: AblationMetricDiff): string => {
  const isNeutral = Math.abs(diff.diff) < 0.01
  const isGood = diff.goodDirection === 'up' ? diff.diff > 0 : diff.diff < 0
  if (isNeutral) return 'border-slate-200 bg-slate-50 text-slate-500'
  if (isGood) return 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
  return 'border-amber-200 bg-amber-50/70 text-amber-700'
}

export const AblationMetricDiffCards = ({ diffs }: AblationMetricDiffCardsProps) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {diffs.map((diff) => (
      <div key={diff.label} className={`rounded-xl border p-3 ${getCardTone(diff)}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{diff.label}</p>
        <p className="mt-1 text-2xl font-black">{Math.abs(diff.diff) < 0.01 ? '—' : diff.formatted}</p>
      </div>
    ))}
  </div>
)
