import { Layers3 } from 'lucide-react'
import { MODE_DISPLAY_CONFIG, OVERVIEW_MODE_ORDER } from './modeDisplayConfig'
import type { OverviewMode } from './modeUiTypes'
import { StatusBadge } from '../shared/StatusBadge'

type ModeSelectorProps = {
  selectedMode: OverviewMode
  onChange: (mode: OverviewMode) => void
}

export const ModeSelector = ({ selectedMode, onChange }: ModeSelectorProps) => (
  <section className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-4 shadow-[0_18px_50px_-30px_rgba(34,211,238,0.45)]">
    <div className="flex items-center gap-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-2 text-cyan-200">
        <Layers3 className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Mode Selector</p>
        <p className="text-sm font-semibold text-slate-100">新 / 旧 / LLM を UI 上で分けて確認</p>
      </div>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {OVERVIEW_MODE_ORDER.map((mode) => {
        const config = MODE_DISPLAY_CONFIG[mode]
        const isActive = selectedMode === mode

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={isActive}
            className={`flex min-h-28 flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all ${config.borderClass} ${isActive ? 'ring-2 ring-cyan-300/60' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-bold ${config.accentClass}`}>{config.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{config.description}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'border-white/20 bg-white/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                {config.shortLabel}
              </span>
            </div>
            <StatusBadge className={config.badgeClass}>{config.badge}</StatusBadge>
          </button>
        )
      })}
    </div>
  </section>
)
