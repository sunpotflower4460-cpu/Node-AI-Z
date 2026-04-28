import type { SignalOverviewViewModel } from '../overview/buildSignalOverviewViewModel'
import { StickySummaryBar } from '../layout/StickySummaryBar'

type MobileOverviewCardsProps = {
  viewModel: SignalOverviewViewModel
}

export const MobileOverviewCards = ({ viewModel }: MobileOverviewCardsProps) => (
  <div className="flex flex-col gap-3 px-3 py-4">
    <StickySummaryBar
      mode={viewModel.modeLabel}
      stage={viewModel.development.currentStage}
      riskLevel={viewModel.risk.level}
    />

    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">現在のモード</p>
      <p className="mt-2 text-lg font-extrabold text-white">{viewModel.modeLabel}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{viewModel.modeDescription}</p>
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">現在地</p>
      <p className="mt-2 text-sm font-bold text-white">{viewModel.development.currentStage}</p>
      <p className="mt-1 text-xs text-slate-400">{viewModel.development.stageSummary}</p>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-500">Assemblies</p>
        <p className="mt-1 text-2xl font-black text-white">{viewModel.growth.assemblyCount}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-500">Bridges</p>
        <p className="mt-1 text-2xl font-black text-white">{viewModel.growth.bridgeCount}</p>
      </div>
    </div>

    {viewModel.nextActions.length > 0 ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Next Action</p>
        <p className="mt-2 text-sm text-slate-300">{viewModel.nextActions[0]}</p>
      </div>
    ) : null}
  </div>
)
