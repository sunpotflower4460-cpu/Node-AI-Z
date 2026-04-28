import type { UiDetailMode } from '../mode/modeUiTypes'
import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import { buildTeacherDependencyViewModel } from '../teacher/buildTeacherDependencyViewModel'
import { BridgeMaturityRing } from '../visual/BridgeMaturityRing'
import { EmptyGrowthIllustration } from '../visual/EmptyGrowthIllustration'

type MobileTeacherPanelsProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const MobileTeacherPanels = ({ source }: MobileTeacherPanelsProps) => {
  if (!source) {
    return (
      <div className="px-3 py-4">
        <EmptyGrowthIllustration
          message="Teacher Dependency のデータがありません。"
          hint="New Signal Mode で Analyze を実行すると依存度データが表示されます。"
        />
      </div>
    )
  }

  const viewModel = buildTeacherDependencyViewModel(source)

  return (
    <div className="flex flex-col gap-4 px-3 py-4">
      <div className="flex items-center gap-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <BridgeMaturityRing
          teacherDependency={viewModel.averageTeacherDependency}
          recallSuccess={0.5}
          size={72}
        />
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Teacher Dependency
          </p>
          <p className="text-2xl font-black text-white">
            {`${Math.round(viewModel.averageTeacherDependency * 100)}%`}
          </p>
          {viewModel.hasOvertrustRisk ? (
            <p className="text-xs text-amber-400">Over-trust リスクあり</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-purple-900 bg-purple-950/50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-purple-400">Assisted</p>
          <p className="mt-1 text-xl font-black text-white">{viewModel.teacherAssistedBridgeCount}</p>
        </div>
        <div className="rounded-xl border border-violet-900 bg-violet-950/50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-violet-400">Light</p>
          <p className="mt-1 text-xl font-black text-white">{viewModel.teacherLightBridgeCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-emerald-400">Free</p>
          <p className="mt-1 text-xl font-black text-white">{viewModel.teacherFreeBridgeCount}</p>
        </div>
      </div>
    </div>
  )
}
