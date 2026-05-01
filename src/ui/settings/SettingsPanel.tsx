import type { ScreenMode, EngineMode, DetailMode } from './types/settingsUiTypes'
import type { DisplaySettings } from './DisplaySettingsSection'
import type { ResearchSettings } from './ResearchSettingsSection'
import { BasicSettingsSection } from './BasicSettingsSection'
import { EngineSettingsSection } from './EngineSettingsSection'
import { DisplaySettingsSection } from './DisplaySettingsSection'
import { ResearchSettingsSection } from './ResearchSettingsSection'
import { StorageSettingsSection } from './StorageSettingsSection'
import { DangerZone } from './DangerZone'
import { SimpleResearchSettingsToggle } from './SimpleResearchSettingsToggle'
import { CollapsibleSection } from '../layout/CollapsibleSection'

type SettingsPanelProps = {
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

export const SettingsPanel = ({
  screenMode,
  engine,
  detailMode,
  displaySettings,
  researchSettings,
  storageSettings,
  onScreenModeChange,
  onEngineChange,
  onDetailModeChange,
  onDisplaySettingsChange,
  onResearchSettingsChange,
  onAutosaveChange,
  onSaveNow,
  onRestore,
  onResetSignalMode,
  onClearSnapshots,
  onClearScenarioResults,
  onClearUiPreferences,
}: SettingsPanelProps) => (
  <div className="flex flex-col gap-6 p-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold text-slate-100">設定</h2>
      <SimpleResearchSettingsToggle detailMode={detailMode} onChange={onDetailModeChange} />
    </div>

    <BasicSettingsSection
      screenMode={screenMode}
      engine={engine}
      detailMode={detailMode}
      onScreenModeChange={onScreenModeChange}
      onEngineChange={onEngineChange}
      onDetailModeChange={onDetailModeChange}
    />

    {detailMode === 'research' ? (
      <EngineSettingsSection
        selectedEngine={engine}
        detailMode={detailMode}
        onEngineChange={onEngineChange}
      />
    ) : null}

    <DisplaySettingsSection
      settings={displaySettings}
      detailMode={detailMode}
      onChange={onDisplaySettingsChange}
    />

    <ResearchSettingsSection
      settings={researchSettings}
      detailMode={detailMode}
      onChange={onResearchSettingsChange}
    />

    <StorageSettingsSection
      hasSnapshot={storageSettings.hasSnapshot}
      lastSavedLabel={storageSettings.lastSavedLabel}
      autosaveEnabled={storageSettings.autosaveEnabled}
      onAutosaveChange={onAutosaveChange}
      onSaveNow={onSaveNow}
      onRestore={onRestore}
    />

    {detailMode === 'simple' ? (
      <CollapsibleSection title="詳細エンジン設定" defaultOpen={false}>
        <EngineSettingsSection
          selectedEngine={engine}
          detailMode={detailMode}
          onEngineChange={onEngineChange}
        />
      </CollapsibleSection>
    ) : null}

    <DangerZone
      onResetSignalMode={onResetSignalMode}
      onClearSnapshots={onClearSnapshots}
      onClearScenarioResults={onClearScenarioResults}
      onClearUiPreferences={onClearUiPreferences}
    />
  </div>
)
