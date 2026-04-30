import type { CurrentStatusViewModel } from '../viewModels/buildCurrentStatusViewModel'

const RISK_COLOR: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
}

type CurrentStatusBarProps = {
  viewModel: CurrentStatusViewModel
  onNavigateToDetails?: () => void
}

export const CurrentStatusBar = ({ viewModel, onNavigateToDetails }: CurrentStatusBarProps) => (
  <div
    className="sticky top-0 z-20 flex w-full items-center gap-0 overflow-hidden border-b border-slate-800/70 bg-slate-950/95 px-3 py-1.5 backdrop-blur-sm"
    aria-label="現在地ステータス"
  >
    <button
      type="button"
      onClick={onNavigateToDetails}
      className="flex min-w-0 flex-1 items-center gap-2 text-left"
      aria-label="詳細カードへ移動"
    >
      <span className="shrink-0 text-[11px] font-bold text-cyan-400">{viewModel.engineShortLabel}</span>
      <span className="shrink-0 text-[10px] text-slate-500">｜</span>
      <span className="shrink-0 text-[11px] text-slate-300">{viewModel.stageShortLabel}</span>
      <span className="shrink-0 text-[10px] text-slate-500">｜</span>
      <span className={`shrink-0 text-[11px] font-bold ${RISK_COLOR[viewModel.riskLevel]}`}>{viewModel.riskShortLabel}</span>
      <span className="shrink-0 text-[10px] text-slate-500">｜</span>
      <span className="truncate text-[11px] text-slate-400">{viewModel.snapshotShortLabel}</span>
    </button>
  </div>
)
