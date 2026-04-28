import type { TimelineEvent } from './buildHistoryTimelineViewModel'
import { TimelineEventCard } from './TimelineEventCard'

type TimelineEventListProps = {
  events: TimelineEvent[]
  showRawIds?: boolean
}

export const TimelineEventList = ({ events, showRawIds = false }: TimelineEventListProps) => {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-xs font-medium text-slate-400">
        表示するイベントはありません。
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {events.map((event) => (
        <TimelineEventCard key={event.id} event={event} showRawId={showRawIds} />
      ))}
    </div>
  )
}
