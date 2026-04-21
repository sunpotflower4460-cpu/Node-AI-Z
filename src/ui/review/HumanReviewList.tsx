import type { HumanReviewEntry } from '../../core'

type HumanReviewListProps = {
  items: HumanReviewEntry[]
  selectedId?: string
  onSelect: (candidateId: string) => void
  emptyLabel?: string
}

const formatTimestamp = (value: number) => {
  const date = new Date(value)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const riskColor: Record<HumanReviewEntry['summary']['riskLevel'], string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-rose-100 text-rose-700 border-rose-200',
}

export const HumanReviewList = ({ items, selectedId, onSelect, emptyLabel = 'No review candidates' }: HumanReviewListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isSelected = item.summary.candidateId === selectedId
        return (
          <button
            key={item.summary.candidateId}
            type="button"
            onClick={() => onSelect(item.summary.candidateId)}
            className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${isSelected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {item.summary.candidateKind}
                  <span className="ml-2 text-xs font-medium text-slate-500">{item.guardianMode}</span>
                </div>
                <div className="text-xs font-medium text-slate-500">
                  status: <span className="font-semibold text-slate-800">{item.promotionStatus}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatTimestamp(item.summary.createdAt)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${riskColor[item.summary.riskLevel]}`}>
                  {item.summary.riskLevel}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {(item.summary.confidenceScore * 100).toFixed(0)}% conf
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.reviewStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.reviewStatus}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
