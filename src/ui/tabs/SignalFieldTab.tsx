import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { SignalFieldView } from '../signalField/SignalFieldView'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { TabEmptyState } from '../shared/TabEmptyState'

type SignalFieldTabProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const SignalFieldTab = ({ source, detailMode }: SignalFieldTabProps) => {
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Field — Signal Field' : '発火'}
        description={
          isResearch
            ? 'View the signal field: particles, assemblies, and bridges.'
            : '発火した点群と結びつき候補を確認します。'
        }
      />

      {source ? (
        <SignalFieldView source={source} detailMode={detailMode} />
      ) : (
        <TabEmptyState
          title={isResearch ? 'No field data yet' : 'まだ発火データはありません'}
          description={
            isResearch
              ? 'Run Analyze to see activated particles, assemblies, and bridge candidates.'
              : 'Analyze すると、発火した点群と結びつき候補が表示されます。'
          }
          nextAction={isResearch ? 'Run Analyze to start' : 'Analyze して発火場を確認する'}
        />
      )}
    </div>
  )
}
