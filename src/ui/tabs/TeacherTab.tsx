import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { TeacherDependencyView } from '../teacher/TeacherDependencyView'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { TabEmptyState } from '../shared/TabEmptyState'

type TeacherTabProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const TeacherTab = ({ source, detailMode }: TeacherTabProps) => {
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Teacher' : '先生'}
        description={
          isResearch
            ? 'Track Binding Teacher dependency and the progress toward teacher-free bridges.'
            : 'Binding Teacher への依存度と teacher-free 化の進捗を確認します。'
        }
      />

      {source ? (
        <TeacherDependencyView source={source} detailMode={detailMode} />
      ) : (
        <TabEmptyState
          title={isResearch ? 'No teacher data yet' : 'まだ先生データはありません'}
          description={
            isResearch
              ? 'Run Analyze in New Signal Mode to see teacher dependency data.'
              : 'New Signal Mode で Analyze を実行すると先生依存度データが表示されます。'
          }
          nextAction={isResearch ? 'Run Analyze to start' : 'Analyze して依存度を確認する'}
        />
      )}
    </div>
  )
}
