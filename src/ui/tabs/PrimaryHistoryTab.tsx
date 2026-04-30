import type { ObservationRecord } from '../../types/experience'
import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { HistoryTimelineView } from '../history/HistoryTimelineView'
import { HistoryTab as ObservationHistoryTab } from './HistoryTab'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { TabEmptyState } from '../shared/TabEmptyState'

type PrimaryHistoryTabProps = {
  source: SignalOverviewSource | null
  history: ObservationRecord[]
  detailMode: UiDetailMode
  onRestore: (item: ObservationRecord) => void
}

export const PrimaryHistoryTab = ({
  source,
  history,
  detailMode,
  onRestore,
}: PrimaryHistoryTabProps) => {
  const isResearch = detailMode === 'research'
  const hasHistory = history.length > 0
  const hasSnapshot = source?.snapshot != null

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'History' : '履歴'}
        description={
          isResearch
            ? 'Snapshot history, stage changes, bridge maturity, and scenario history.'
            : 'Analyze / snapshot / stage 変化 / scenario 実行の履歴を確認します。'
        }
      />

      {hasSnapshot || hasHistory ? (
        <>
          <HistoryTimelineView
            input={{ snapshots: source?.snapshot ? [source.snapshot] : [] }}
            detailMode={detailMode}
          />

          {hasHistory ? (
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isResearch ? 'Observation History' : '観察履歴'}
              </p>
              <ObservationHistoryTab history={history} restoreHistory={onRestore} />
            </div>
          ) : null}
        </>
      ) : (
        <TabEmptyState
          title={isResearch ? 'No history yet' : 'まだ履歴はありません'}
          description={
            isResearch
              ? 'Analyze, snapshot, stage changes, and scenario executions will be recorded here.'
              : 'Analyze / snapshot / stage 変化 / scenario 実行が起きると、ここに記録されます。'
          }
          nextAction={isResearch ? 'Run Analyze to start' : 'まず Analyze を実行する'}
        />
      )}
    </div>
  )
}
