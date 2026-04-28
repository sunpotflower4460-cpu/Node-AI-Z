import type { GrowthRecallEvent } from './buildGrowthViewModel'
import { EmptyState } from '../shared/EmptyState'

type RecallEventListProps = {
  events: GrowthRecallEvent[]
  researchMode?: boolean
}

const summarizeEvent = (event: GrowthRecallEvent): string => {
  if (event.success && !event.usedTeacher) return 'teacher なしで想起成功'
  if (event.success && event.usedTeacher) return 'teacher ありで想起成功'
  return '想起失敗'
}

const EVENT_COLOR: Record<string, string> = {
  'teacher なしで想起成功': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'teacher ありで想起成功': 'border-indigo-200 bg-indigo-50 text-indigo-700',
  '想起失敗': 'border-red-200 bg-red-50 text-red-700',
}

export const RecallEventList = ({ events, researchMode = false }: RecallEventListProps) => {
  if (events.length === 0) {
    return (
      <EmptyState
        title="想起イベントはまだありません。"
        description="bridge の recall が試みられるとここに記録されます。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {events
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20)
        .map((event) => {
          const summary = summarizeEvent(event)
          const colorClass = EVENT_COLOR[summary] ?? 'border-slate-200 bg-slate-50 text-slate-600'
          return (
            <div
              key={event.id}
              className={`rounded-xl border px-3 py-2.5 ${colorClass}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{summary}</span>
                {researchMode && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(event.timestamp).toISOString().slice(11, 19)}
                  </span>
                )}
              </div>
              {researchMode && (
                <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                  <div>source: {event.sourceAssemblyId}</div>
                  {event.recalledAssemblyId && <div>recalled: {event.recalledAssemblyId}</div>}
                  {event.notes.length > 0 && <div>notes: {event.notes.join(' / ')}</div>}
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
