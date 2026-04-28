export type TimelineEventType =
  | 'snapshot'
  | 'stage_change'
  | 'bridge_matured'
  | 'consolidation'
  | 'risk_detected'
  | 'risk_resolved'
  | 'scenario'
  | 'other'

type TimelineBadgeProps = {
  eventType: TimelineEventType
}

const EVENT_STYLES: Record<TimelineEventType, { label: string; colorClass: string }> = {
  snapshot: { label: 'Snapshot', colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  stage_change: { label: 'Stage', colorClass: 'bg-violet-100 text-violet-700 border-violet-200' },
  bridge_matured: { label: 'Bridge', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  consolidation: { label: 'Consolidation', colorClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  risk_detected: { label: 'Risk', colorClass: 'bg-red-100 text-red-700 border-red-200' },
  risk_resolved: { label: 'Risk OK', colorClass: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  scenario: { label: 'Scenario', colorClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  other: { label: 'Event', colorClass: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const TimelineBadge = ({ eventType }: TimelineBadgeProps) => {
  const { label, colorClass } = EVENT_STYLES[eventType]
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
      {label}
    </span>
  )
}
