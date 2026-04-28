import type { UiDetailMode } from '../mode/modeUiTypes'
import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import { buildGrowthViewModel } from '../growth/buildGrowthViewModel'
import { EmptyGrowthIllustration } from '../visual/EmptyGrowthIllustration'
import { BridgeMaturityBadge } from '../visual/BridgeMaturityBadge'
import type { BridgeStage } from '../visual/SignalFieldVisualTheme'

type MobileGrowthPanelsProps = {
  source: SignalOverviewSource | null
  detailMode: UiDetailMode
}

export const MobileGrowthPanels = ({ source, detailMode: _detailMode }: MobileGrowthPanelsProps) => {
  if (!source) {
    return (
      <div className="px-3 py-4">
        <EmptyGrowthIllustration />
      </div>
    )
  }

  const viewModel = buildGrowthViewModel(source)

  return (
    <div className="flex flex-col gap-4 px-3 py-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-slate-500">Assembly</p>
          <p className="mt-1 text-2xl font-black text-white">{viewModel.assemblies.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-slate-500">Bridge</p>
          <p className="mt-1 text-2xl font-black text-white">{viewModel.bridges.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-slate-500">Proto</p>
          <p className="mt-1 text-2xl font-black text-white">{viewModel.protoSeeds.length}</p>
        </div>
      </div>

      {viewModel.bridges.slice(0, 5).map((bridge) => (
        <div
          key={bridge.id}
          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2"
        >
          <span className="text-xs text-slate-300 truncate max-w-[60%]">{bridge.id}</span>
          <BridgeMaturityBadge stage={bridge.stage as BridgeStage} size="sm" />
        </div>
      ))}

      {viewModel.bridges.length === 0 && (
        <EmptyGrowthIllustration
          message="まだ bridge がありません。"
          hint="発火を繰り返すと bridge が育ち始めます。"
        />
      )}
    </div>
  )
}
