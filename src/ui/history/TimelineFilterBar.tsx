import type { TimelineEventType } from '../shared/TimelineBadge'

export type TimelineFilter = 'All' | TimelineEventType

const FILTER_LABELS: Array<{ key: TimelineFilter; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'stage_change', label: 'Stages' },
  { key: 'bridge_matured', label: 'Bridges' },
  { key: 'consolidation', label: 'Consolidation' },
  { key: 'risk_detected', label: 'Risk' },
  { key: 'scenario', label: 'Scenario' },
  { key: 'snapshot', label: 'Snapshots' },
]

type TimelineFilterBarProps = {
  activeFilter: TimelineFilter
  onFilterChange: (filter: TimelineFilter) => void
}

export const TimelineFilterBar = ({ activeFilter, onFilterChange }: TimelineFilterBarProps) => (
  <div className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
    {FILTER_LABELS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        onClick={() => onFilterChange(key)}
        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
          activeFilter === key
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
)
