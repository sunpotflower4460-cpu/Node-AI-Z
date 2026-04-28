import { Compass, Cpu, Microscope } from 'lucide-react'
import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { SimpleResearchToggle } from './SimpleResearchToggle'

type OverviewHeaderProps = {
  viewModel: SignalOverviewViewModel
  detailMode: UiDetailMode
  onDetailModeChange: (mode: UiDetailMode) => void
}

export const OverviewHeader = ({ viewModel, detailMode, onDetailModeChange }: OverviewHeaderProps) => (
  <section className="rounded-[32px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_rgba(2,6,23,0.96)_55%)] p-5 shadow-[0_24px_80px_-40px_rgba(34,211,238,0.55)]">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100">
          <Compass className="h-3.5 w-3.5" />
          Signal Mode Overview
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white">今どこにいるかが最初に分かる Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {viewModel.todaySummary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-300" />
            Current runtime: {viewModel.currentRuntimeLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">
            <Microscope className="h-3.5 w-3.5 text-violet-300" />
            Snapshot: {viewModel.snapshotLabel}
          </span>
        </div>
      </div>
      <SimpleResearchToggle detailMode={detailMode} onChange={onDetailModeChange} />
    </div>
  </section>
)
