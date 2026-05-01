import type { ScreenMode, EngineMode, DetailMode } from './types/settingsUiTypes'
import { SettingSectionHeader } from './SettingSectionHeader'

type BasicSettingsSectionProps = {
  screenMode: ScreenMode
  engine: EngineMode
  detailMode: DetailMode
  onScreenModeChange: (mode: ScreenMode) => void
  onEngineChange: (engine: EngineMode) => void
  onDetailModeChange: (mode: DetailMode) => void
}

const SCREEN_MODES: { id: ScreenMode; label: string }[] = [
  { id: 'observe', label: '観察' },
  { id: 'experience', label: '体験' },
]

const ENGINE_MODES: { id: EngineMode; label: string }[] = [
  { id: 'signal_mode', label: 'New Signal' },
  { id: 'crystallized_legacy', label: 'Legacy' },
  { id: 'llm_mode', label: 'LLM' },
]

const DETAIL_MODES: { id: DetailMode; label: string }[] = [
  { id: 'simple', label: 'Simple' },
  { id: 'research', label: 'Research' },
]

export const BasicSettingsSection = ({
  screenMode,
  engine,
  detailMode,
  onScreenModeChange,
  onEngineChange,
  onDetailModeChange,
}: BasicSettingsSectionProps) => (
  <div className="flex flex-col gap-4">
    <SettingSectionHeader title="基本設定" />

    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-slate-500">スクリーンモード</p>
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 p-1">
        {SCREEN_MODES.map((m) => {
          const isActive = screenMode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onScreenModeChange(m.id)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-slate-500">エンジン</p>
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 p-1">
        {ENGINE_MODES.map((m) => {
          const isActive = engine === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onEngineChange(m.id)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-slate-500">表示詳細度</p>
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 p-1">
        {DETAIL_MODES.map((m) => {
          const isActive = detailMode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onDetailModeChange(m.id)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>
    </div>
  </div>
)
