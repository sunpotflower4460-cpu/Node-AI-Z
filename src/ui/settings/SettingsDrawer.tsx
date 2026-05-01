import { X } from 'lucide-react'
import type { ScreenMode, EngineMode, DetailMode } from './types/settingsUiTypes'
import type { DisplaySettings } from './DisplaySettingsSection'
import type { ResearchSettings } from './ResearchSettingsSection'
import { SettingsPanel } from './SettingsPanel'

type SettingsDrawerProps = {
  isOpen: boolean
  onClose: () => void
  screenMode: ScreenMode
  engine: EngineMode
  detailMode: DetailMode
  displaySettings: DisplaySettings
  researchSettings: ResearchSettings
  storageSettings: { hasSnapshot: boolean; lastSavedLabel: string; autosaveEnabled: boolean }
  onScreenModeChange: (mode: ScreenMode) => void
  onEngineChange: (engine: EngineMode) => void
  onDetailModeChange: (mode: DetailMode) => void
  onDisplaySettingsChange: (settings: DisplaySettings) => void
  onResearchSettingsChange: (settings: ResearchSettings) => void
  onAutosaveChange: (enabled: boolean) => void
  onSaveNow: () => void
  onRestore: () => void
  onResetSignalMode: () => void
  onClearSnapshots: () => void
  onClearScenarioResults: () => void
  onClearUiPreferences: () => void
}

export const SettingsDrawer = ({ isOpen, onClose, ...panelProps }: SettingsDrawerProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
          <h2 className="text-sm font-bold text-slate-100">設定</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SettingsPanel {...panelProps} />
      </div>
    </div>
  )
}
