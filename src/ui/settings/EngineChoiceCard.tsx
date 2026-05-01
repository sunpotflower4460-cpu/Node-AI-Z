import type { EngineCardConfig } from './types/engineSettingsTypes'
import type { EngineMode, DetailMode } from './types/settingsUiTypes'
import { StatusBadge } from '../shared/StatusBadge'

type EngineChoiceCardProps = {
  config: EngineCardConfig
  isSelected: boolean
  detailMode: DetailMode
  onSelect: (id: EngineMode) => void
}

export const EngineChoiceCard = ({
  config,
  isSelected,
  detailMode,
  onSelect,
}: EngineChoiceCardProps) => {
  const desc = detailMode === 'research' ? config.description : config.shortDescription

  return (
    <button
      type="button"
      onClick={() => onSelect(config.id)}
      aria-pressed={isSelected}
      className={`flex flex-col items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all ${config.borderClass} ${isSelected ? 'ring-2 ring-cyan-300/60' : 'opacity-80 hover:opacity-100'}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <p className={`text-sm font-bold ${config.accentClass}`}>{config.label}</p>
        {detailMode === 'research' ? (
          <span className="font-mono text-[10px] text-slate-600">{config.internalId}</span>
        ) : null}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-300">{desc}</p>
      <StatusBadge className={config.badgeClass}>{config.badgeText}</StatusBadge>
    </button>
  )
}
