import { TimelineBadge } from '../shared/TimelineBadge'
import type { TimelineEvent } from './buildHistoryTimelineViewModel'

type TimelineEventCardProps = {
  event: TimelineEvent
  showRawId?: boolean
}

const formatTimestamp = (ts: number): string => {
  return new Date(ts).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const TimelineEventCard = ({ event, showRawId = false }: TimelineEventCardProps) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-300 mt-1.5" />
      <div className="mt-1 w-px flex-1 bg-slate-100" />
    </div>
    <div className="mb-4 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <TimelineBadge eventType={event.eventType} />
        <span className="text-[10px] font-semibold text-slate-400">{formatTimestamp(event.timestamp)}</span>
        {showRawId && event.rawId ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{event.rawId}</span>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-slate-800">{event.title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{event.description}</p>
      {event.score !== undefined && event.scoreLabel ? (
        <p className="mt-1 text-[11px] font-semibold text-indigo-700">
          {event.scoreLabel}: {event.score.toFixed(2)}
        </p>
      ) : null}
      {event.scoreDelta !== undefined && event.scoreLabel ? (
        <p className={`mt-1 text-[11px] font-semibold ${event.scoreDelta >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {event.scoreLabel}: {event.scoreDelta > 0 ? '+' : ''}{event.scoreDelta}
        </p>
      ) : null}
      {event.notes && event.notes.length > 0 ? (
        <ul className="mt-2 space-y-0.5">
          {event.notes.map((note) => (
            <li key={note} className="text-[10px] leading-relaxed text-slate-400">· {note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  </div>
)
