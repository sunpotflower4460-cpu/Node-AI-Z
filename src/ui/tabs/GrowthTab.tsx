import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { GrowthView } from '../growth/GrowthView'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { TabEmptyState } from '../shared/TabEmptyState'

type GrowthTabProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const GrowthTab = ({ source, detailMode }: GrowthTabProps) => {
  const isResearch = detailMode === 'research'
  const hasData =
    source !== null &&
    (source.observeSummary.branch.assemblyCount > 0 ||
      source.observeSummary.branch.bridgeCount > 0 ||
      source.observeSummary.branch.protoSeedCount > 0)

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Growth' : '成長'}
        description={
          isResearch
            ? 'Signal Mode saved assemblies, bridges, and proto seeds as personal experience.'
            : 'Signal Mode が自分の経験として保存した assembly / bridge / proto seed を見ます。'
        }
      />

      {hasData ? (
        <GrowthView source={source} detailMode={detailMode} />
      ) : (
        <TabEmptyState
          title={isResearch ? 'No growth records yet' : 'まだ成長記録はありません'}
          description={
            isResearch
              ? 'Repeat Analyze with similar inputs to build assemblies.'
              : '繰り返し発火した点群が assembly として保存されると、ここに表示されます。'
          }
          nextAction={isResearch ? 'Analyze several times to grow assemblies' : '同じ刺激を何度か Analyze する'}
        />
      )}
    </div>
  )
}
