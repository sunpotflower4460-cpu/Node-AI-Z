import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildTeacherDependencyViewModel } from './buildTeacherDependencyViewModel'
import { TeacherDependencyMeter } from './TeacherDependencyMeter'
import { TeacherBridgeStageChart } from './TeacherBridgeStageChart'
import { TeacherBridgeList } from './TeacherBridgeList'
import { TeacherRiskHint } from './TeacherRiskHint'
import { EmptyState } from '../shared/EmptyState'

type TeacherDependencyViewProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const TeacherDependencyView = ({ source, detailMode }: TeacherDependencyViewProps) => {
  if (!source) {
    return (
      <EmptyState
        title="Teacher Dependency のデータがありません。"
        description="New Signal Mode で Analyze を実行すると Binding Teacher の依存度データが表示されます。"
      />
    )
  }

  const viewModel = buildTeacherDependencyViewModel(source)
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Teacher Dependency</h2>
        <p className="mt-1 text-xs text-slate-400">
          Binding Teacher の補助輪がどれくらい外れてきたかを観察する
        </p>
      </div>

      <TeacherRiskHint
        riskValue={viewModel.teacherOvertrustRisk}
        hasOvertrustRisk={viewModel.hasOvertrustRisk}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TeacherDependencyMeter value={viewModel.averageTeacherDependency} />

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Teacher-Assisted</p>
            <p className="mt-2 text-2xl font-black text-purple-700">{viewModel.teacherAssistedBridgeCount}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Teacher-Light</p>
            <p className="mt-2 text-2xl font-black text-violet-700">{viewModel.teacherLightBridgeCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Teacher-Free</p>
            <p className="mt-2 text-2xl font-black text-emerald-700">{viewModel.teacherFreeBridgeCount}</p>
          </div>
        </div>
      </div>

      <TeacherBridgeStageChart distribution={viewModel.bridgeStageDistribution} />

      <div>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Bridge List</h3>
        <TeacherBridgeList bridges={viewModel.bridges} researchMode={isResearch} />
      </div>
    </div>
  )
}
