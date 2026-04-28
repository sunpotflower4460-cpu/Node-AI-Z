import type { UiDetailMode } from '../mode/modeUiTypes'

type SimpleResearchToggleProps = {
  detailMode: UiDetailMode
  onChange: (mode: UiDetailMode) => void
}

export const SimpleResearchToggle = ({ detailMode, onChange }: SimpleResearchToggleProps) => (
  <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-1">
    {(['simple', 'research'] as UiDetailMode[]).map((mode) => {
      const isActive = detailMode === mode

      return (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          aria-pressed={isActive}
          className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-colors ${isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          {mode === 'simple' ? 'Simple View' : 'Research View'}
        </button>
      )
    })}
  </div>
)
