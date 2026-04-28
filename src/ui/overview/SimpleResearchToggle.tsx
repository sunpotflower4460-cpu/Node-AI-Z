import type { UiDetailMode } from '../mode/modeUiTypes'

type SimpleResearchToggleProps = {
  detailMode: UiDetailMode
  onChange: (mode: UiDetailMode) => void
}

const MODES: { id: UiDetailMode; label: string; description: string }[] = [
  { id: 'simple', label: 'Simple', description: 'わかりやすい要約を表示' },
  { id: 'research', label: 'Research', description: '詳細な内部指標を表示' },
]

export const SimpleResearchToggle = ({ detailMode, onChange }: SimpleResearchToggleProps) => (
  <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 p-1">
    {MODES.map((mode) => {
      const isActive = detailMode === mode.id

      return (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          aria-pressed={isActive}
          title={mode.description}
          className={`group flex flex-col items-start rounded-full px-3 py-1.5 text-left transition-colors sm:flex-row sm:items-center sm:gap-2 ${
            isActive
              ? 'bg-cyan-400 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-xs font-bold">{mode.label}</span>
          <span
            className={`hidden text-[10px] sm:inline ${
              isActive ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-400'
            }`}
          >
            {mode.description}
          </span>
        </button>
      )
    })}
  </div>
)
