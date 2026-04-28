import { useState } from 'react'
import type { BuildHistoryTimelineInput, TimelineEvent } from './buildHistoryTimelineViewModel'
import { buildHistoryTimelineViewModel } from './buildHistoryTimelineViewModel'
import { TimelineFilterBar, type TimelineFilter } from './TimelineFilterBar'
import { TimelineEventList } from './TimelineEventList'
import { SnapshotHistoryPanel } from './SnapshotHistoryPanel'
import { EmptyState } from '../shared/EmptyState'
import { SectionHeader } from '../shared/SectionHeader'
import type { UiDetailMode } from '../mode/modeUiTypes'

type HistoryTimelineViewProps = {
  input: BuildHistoryTimelineInput
  detailMode: UiDetailMode
}

const filterEvents = (events: TimelineEvent[], filter: TimelineFilter): TimelineEvent[] => {
  if (filter === 'All') return events
  return events.filter((event) => event.eventType === filter)
}

export const HistoryTimelineView = ({ input, detailMode }: HistoryTimelineViewProps) => {
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('All')

  const viewModel = buildHistoryTimelineViewModel(input)
  const filteredEvents = filterEvents(viewModel.events, activeFilter)

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="History Timeline"
        description="Signal Mode がどう育ってきたかを時系列で見ます。"
        badge={
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            New Signal Mode
          </span>
        }
      />

      {viewModel.hasEvents ? (
        <>
          <TimelineFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <TimelineEventList
            events={filteredEvents}
            showRawIds={detailMode === 'research'}
          />
        </>
      ) : (
        <EmptyState
          title="まだ timeline event は少ないです。"
          description="学習・保存・stage 変化が起きると履歴が増えていきます。"
        />
      )}

      {detailMode === 'research' || viewModel.snapshotHistory.length > 0 ? (
        <SnapshotHistoryPanel snapshots={viewModel.snapshotHistory} />
      ) : null}
    </div>
  )
}
