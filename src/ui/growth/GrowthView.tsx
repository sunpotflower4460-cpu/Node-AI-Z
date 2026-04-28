import { useState } from 'react'
import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildGrowthViewModel } from './buildGrowthViewModel'
import { BranchSummaryCards } from './BranchSummaryCards'
import { AssemblyRecordCard } from './AssemblyRecordCard'
import { BridgeRecordCard } from './BridgeRecordCard'
import { ProtoSeedRecordCard } from './ProtoSeedRecordCard'
import { RecallEventList } from './RecallEventList'
import { FilterChips } from '../shared/FilterChips'
import { EmptyState } from '../shared/EmptyState'

type GrowthTab = 'Assemblies' | 'Bridges' | 'ProtoSeeds' | 'Recall'

const TAB_LABELS: Record<GrowthTab, string> = {
  Assemblies: 'Assembly',
  Bridges: 'Bridge',
  ProtoSeeds: 'Proto Seed',
  Recall: 'Recall',
}

const TABS: GrowthTab[] = ['Assemblies', 'Bridges', 'ProtoSeeds', 'Recall']

type GrowthViewProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const GrowthView = ({ source, detailMode }: GrowthViewProps) => {
  const [activeTab, setActiveTab] = useState<GrowthTab>('Assemblies')

  if (!source) {
    return (
      <EmptyState
        title="Growth データがありません。"
        description="New Signal Mode で Analyze を実行すると Personal Branch の成長データが表示されます。"
      />
    )
  }

  const viewModel = buildGrowthViewModel(source)
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Growth / Personal Branch</h2>
        <p className="mt-1 text-xs text-slate-400">
          Signal Mode が「自分の経験」として育てている assembly・bridge・proto seed の一覧
        </p>
      </div>

      <BranchSummaryCards summary={viewModel.summary} />

      <div className="flex flex-col gap-3">
        <FilterChips
          options={TABS}
          selected={activeTab}
          labelMap={TAB_LABELS}
          onChange={setActiveTab}
        />

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          {activeTab === 'Assemblies' && (
            <AssemblyRecordCard records={viewModel.assemblies} researchMode={isResearch} />
          )}
          {activeTab === 'Bridges' && (
            <BridgeRecordCard records={viewModel.bridges} researchMode={isResearch} />
          )}
          {activeTab === 'ProtoSeeds' && (
            <ProtoSeedRecordCard records={viewModel.protoSeeds} researchMode={isResearch} />
          )}
          {activeTab === 'Recall' && (
            <RecallEventList events={viewModel.recallEvents} researchMode={isResearch} />
          )}
        </div>
      </div>
    </div>
  )
}
