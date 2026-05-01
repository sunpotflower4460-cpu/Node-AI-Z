import { Save, RotateCcw } from 'lucide-react'
import { SettingSectionHeader } from './SettingSectionHeader'

type StorageSettingsSectionProps = {
  hasSnapshot: boolean
  lastSavedLabel: string
  autosaveEnabled: boolean
  onAutosaveChange: (enabled: boolean) => void
  onSaveNow: () => void
  onRestore: () => void
}

export const StorageSettingsSection = ({
  hasSnapshot,
  lastSavedLabel,
  autosaveEnabled,
  onAutosaveChange,
  onSaveNow,
  onRestore,
}: StorageSettingsSectionProps) => (
  <div className="flex flex-col gap-3">
    <SettingSectionHeader title="保存 / 復元" />

    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500">最終保存</span>
        <span className="text-xs font-bold text-slate-300">{lastSavedLabel}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200">Autosave</span>
        <button
          type="button"
          role="switch"
          aria-checked={autosaveEnabled}
          onClick={() => onAutosaveChange(!autosaveEnabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
            autosaveEnabled ? 'border-cyan-500 bg-cyan-500/30' : 'border-slate-700 bg-slate-800'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
              autosaveEnabled ? 'translate-x-4 bg-cyan-300' : 'translate-x-1 bg-slate-500'
            }`}
          />
        </button>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={onSaveNow}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-700"
      >
        <Save className="h-3.5 w-3.5" />
        今すぐ保存
      </button>
      <button
        type="button"
        onClick={onRestore}
        disabled={!hasSnapshot}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        復元
      </button>
    </div>

    <p className="text-[11px] text-slate-600">
      この保存は New Signal Mode の状態のみを対象にします。
    </p>
  </div>
)
