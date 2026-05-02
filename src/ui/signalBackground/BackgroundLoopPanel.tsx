import type { BackgroundViewModel } from './buildBackgroundViewModel'

type BackgroundLoopPanelProps = {
  background: BackgroundViewModel['background']
  simpleView?: boolean
}

const modeColors: Record<string, string> = {
  awake: 'bg-green-400',
  idle: 'bg-slate-300',
  quiet: 'bg-blue-300',
  replay: 'bg-violet-400',
  maintenance: 'bg-amber-400',
}

const cycleTypeLabels: Record<string, { en: string; ja: string }> = {
  micro_pulse: { en: 'micro pulse', ja: 'マイクロ発火' },
  weak_replay: { en: 'weak replay', ja: '弱い再生' },
  maintenance: { en: 'maintenance', ja: 'メンテナンス' },
  none: { en: 'none', ja: 'なし' },
}

/**
 * Displays the background loop state for New Signal Mode.
 * The background loop keeps internal state alive between inputs.
 */
export const BackgroundLoopPanel = ({ background, simpleView = false }: BackgroundLoopPanelProps) => {
  const modeColor = modeColors[background.mode] ?? 'bg-slate-300'
  const cycleLabel = cycleTypeLabels[background.lastCycleType] ?? cycleTypeLabels['none']!

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        {simpleView ? 'バックグラウンドループ' : 'Background Loop'}
      </h3>

      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${modeColor}`} />
        <span className="text-sm font-medium text-slate-700">{background.mode}</span>
        {background.isRunning && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
            {simpleView ? '稼働中' : 'running'}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        <div>
          <span className="text-slate-400">{simpleView ? 'tick数' : 'ticks'}</span>
          <span className="ml-1 font-mono">{background.tickCount}</span>
        </div>
        <div>
          <span className="text-slate-400">{simpleView ? '最終実行' : 'last tick'}</span>
          <span className="ml-1">{background.lastTickAgo}</span>
        </div>
        <div>
          <span className="text-slate-400">{simpleView ? '最終サイクル' : 'last cycle'}</span>
          <span className="ml-1">{simpleView ? cycleLabel.ja : cycleLabel.en}</span>
        </div>
        <div>
          <span className="text-slate-400">{simpleView ? '待機再生' : 'pending replay'}</span>
          <span className="ml-1 font-mono">{background.pendingReplayCount}</span>
        </div>
        <div>
          <span className="text-slate-400">{simpleView ? 'スキップ' : 'skipped'}</span>
          <span className="ml-1 font-mono">{background.skippedTicks}</span>
        </div>
        <div>
          <span className="text-slate-400">{simpleView ? '負荷' : 'load'}</span>
          <span className="ml-1 font-mono">{(background.loopLoad * 100).toFixed(0)}%</span>
        </div>
      </div>

      {background.hasError && (
        <p className="mt-2 truncate text-[10px] text-red-400">
          {background.lastError}
        </p>
      )}

      <p className="mt-3 text-[9px] text-slate-300">
        {simpleView
          ? '入力がない間も、弱い残響と再生準備が更新されます'
          : 'background micro pulse · weak replay · maintenance'}
      </p>
    </div>
  )
}
