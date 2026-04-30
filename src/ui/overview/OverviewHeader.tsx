import { Compass, Cpu, Microscope } from 'lucide-react'
import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { SimpleResearchToggle } from './SimpleResearchToggle'
import { CollapsibleInfoBlock } from '../shared/CollapsibleInfoBlock'

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
          概要
        </div>
        <h2 className="mt-3 text-xl font-black tracking-tight text-white">現在のモード・発達段階・成長・リスクを確認します。</h2>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-300" />
            {detailMode === 'research' ? `Current runtime: ${viewModel.currentRuntimeLabel}` : `脳エンジン: ${viewModel.currentRuntimeLabel}`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">
            <Microscope className="h-3.5 w-3.5 text-violet-300" />
            {detailMode === 'research' ? `Snapshot: ${viewModel.snapshotLabel}` : `保存状態: ${viewModel.snapshotLabel}`}
          </span>
        </div>
        <div className="mt-3">
          <CollapsibleInfoBlock summary="詳しく見る">
            <p className="text-sm leading-relaxed text-slate-300">{viewModel.todaySummary}</p>
          </CollapsibleInfoBlock>
        </div>
      </div>
      <SimpleResearchToggle detailMode={detailMode} onChange={onDetailModeChange} />
    </div>
  </section>
)
