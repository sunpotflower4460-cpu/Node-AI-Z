import type { GrowthSummary } from './buildGrowthViewModel'

type BranchSummaryCardsProps = {
  summary: GrowthSummary
}

type CardConfig = {
  label: string
  getValue: (s: GrowthSummary) => number | string
  colorClass?: string
}

const CARDS: CardConfig[] = [
  { label: 'Assembly Records', getValue: (s) => s.assemblyCount, colorClass: 'text-indigo-600' },
  { label: 'Bridge Records', getValue: (s) => s.bridgeCount, colorClass: 'text-violet-600' },
  { label: 'Proto Seed Records', getValue: (s) => s.protoSeedCount, colorClass: 'text-amber-600' },
  { label: 'Recall Events', getValue: (s) => s.recallEventCount, colorClass: 'text-blue-600' },
  { label: 'Teacher-Free Bridges', getValue: (s) => s.teacherFreeBridgeCount, colorClass: 'text-emerald-600' },
  {
    label: 'Average Recall Success',
    getValue: (s) => `${Math.round(s.averageRecallSuccess * 100)}%`,
    colorClass: 'text-teal-600',
  },
]

export const BranchSummaryCards = ({ summary }: BranchSummaryCardsProps) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {CARDS.map(({ label, getValue, colorClass = 'text-slate-800' }) => (
      <div
        key={label}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`mt-2 text-2xl font-black ${colorClass}`}>{getValue(summary)}</p>
      </div>
    ))}
  </div>
)
