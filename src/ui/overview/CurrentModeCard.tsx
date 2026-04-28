import { MODE_DISPLAY_CONFIG } from '../mode/modeDisplayConfig'
import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import { StatusBadge } from '../shared/StatusBadge'

type CurrentModeCardProps = {
  viewModel: SignalOverviewViewModel
}

export const CurrentModeCard = ({ viewModel }: CurrentModeCardProps) => {
  const config = MODE_DISPLAY_CONFIG[viewModel.mode]

  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_50px_-30px_rgba(34,211,238,0.35)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Current Mode</p>
      <h3 className={`mt-3 text-xl font-black tracking-tight ${config.accentClass}`}>{viewModel.modeLabel}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{viewModel.modeDescription}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge className={config.badgeClass}>{config.badge}</StatusBadge>
        <StatusBadge className="border-slate-700 bg-slate-900 text-slate-200">現在地: {viewModel.currentLocation}</StatusBadge>
      </div>
    </section>
  )
}
