import type { DetailMode } from './types/settingsUiTypes'
import { SettingSectionHeader } from './SettingSectionHeader'

export type DisplaySettings = {
  preferJapaneseLabels: boolean
  compactCards: boolean
  showRawIds: boolean
  showDebugBadges: boolean
}

type DisplaySettingsSectionProps = {
  settings: DisplaySettings
  detailMode: DetailMode
  onChange: (settings: DisplaySettings) => void
}

type ToggleRowProps = {
  label: string
  description?: string
  checked: boolean
  onToggle: () => void
}

const ToggleRow = ({ label, description, checked, onToggle }: ToggleRowProps) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-200">{label}</span>
      {description ? <span className="text-[11px] text-slate-500">{description}</span> : null}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'border-cyan-500 bg-cyan-500/30' : 'border-slate-700 bg-slate-800'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
          checked ? 'translate-x-4 bg-cyan-300' : 'translate-x-1 bg-slate-500'
        }`}
      />
    </button>
  </label>
)

export const DisplaySettingsSection = ({
  settings,
  detailMode,
  onChange,
}: DisplaySettingsSectionProps) => (
  <div className="flex flex-col gap-3">
    <SettingSectionHeader title="表示設定" />
    <div className="flex flex-col gap-2">
      <ToggleRow
        label="日本語ラベル優先"
        description="UI ラベルを日本語で表示します。"
        checked={settings.preferJapaneseLabels}
        onToggle={() => onChange({ ...settings, preferJapaneseLabels: !settings.preferJapaneseLabels })}
      />
      <ToggleRow
        label="Compact Cards"
        description="カードを小さめに表示します。"
        checked={settings.compactCards}
        onToggle={() => onChange({ ...settings, compactCards: !settings.compactCards })}
      />
      {detailMode === 'research' ? (
        <>
          <ToggleRow
            label="Show raw IDs"
            description="内部IDを表示します。"
            checked={settings.showRawIds}
            onToggle={() => onChange({ ...settings, showRawIds: !settings.showRawIds })}
          />
          <ToggleRow
            label="Show debug badges"
            description="デバッグ用バッジを表示します。"
            checked={settings.showDebugBadges}
            onToggle={() => onChange({ ...settings, showDebugBadges: !settings.showDebugBadges })}
          />
        </>
      ) : null}
    </div>
  </div>
)
