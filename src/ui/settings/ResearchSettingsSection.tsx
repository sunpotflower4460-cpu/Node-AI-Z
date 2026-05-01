import type { DetailMode } from './types/settingsUiTypes'
import { CollapsibleSection } from '../layout/CollapsibleSection'
import { SettingSectionHeader } from './SettingSectionHeader'

export type ResearchSettings = {
  debugTrace: boolean
  rawMetrics: boolean
  ablation: boolean
}

type ResearchSettingsSectionProps = {
  settings: ResearchSettings
  detailMode: DetailMode
  onChange: (settings: ResearchSettings) => void
}

type ToggleRowProps = {
  label: string
  subLabel?: string
  checked: boolean
  onToggle: () => void
}

const ToggleRow = ({ label, subLabel, checked, onToggle }: ToggleRowProps) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-200">{label}</span>
      {subLabel ? <span className="text-[11px] text-slate-500">{subLabel}</span> : null}
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

const ResearchToggles = ({
  settings,
  onChange,
}: {
  settings: ResearchSettings
  onChange: (s: ResearchSettings) => void
}) => (
  <div className="flex flex-col gap-2">
    <ToggleRow
      label="詳細ログ"
      subLabel="debug trace"
      checked={settings.debugTrace}
      onToggle={() => onChange({ ...settings, debugTrace: !settings.debugTrace })}
    />
    <ToggleRow
      label="生データ表示"
      subLabel="raw metrics"
      checked={settings.rawMetrics}
      onToggle={() => onChange({ ...settings, rawMetrics: !settings.rawMetrics })}
    />
    <ToggleRow
      label="機能ON/OFF比較"
      subLabel="ablation"
      checked={settings.ablation}
      onToggle={() => onChange({ ...settings, ablation: !settings.ablation })}
    />
  </div>
)

export const ResearchSettingsSection = ({
  settings,
  detailMode,
  onChange,
}: ResearchSettingsSectionProps) => {
  if (detailMode === 'simple') {
    return (
      <CollapsibleSection title="Research 設定" defaultOpen={false}>
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-slate-500">通常利用では触らなくて大丈夫です。</p>
          <ResearchToggles settings={settings} onChange={onChange} />
        </div>
      </CollapsibleSection>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <SettingSectionHeader
        title="Research 設定"
        description="詳細なデバッグ・計測オプションです。"
      />
      <ResearchToggles settings={settings} onChange={onChange} />
    </div>
  )
}
