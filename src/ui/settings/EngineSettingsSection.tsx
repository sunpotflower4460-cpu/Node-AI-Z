import type { EngineMode, DetailMode } from './types/settingsUiTypes'
import { EngineChoiceCard } from './EngineChoiceCard'
import { ENGINE_CARD_CONFIGS } from './config/engineCardConfigs'
import { SettingSectionHeader } from './SettingSectionHeader'

type EngineSettingsSectionProps = {
  selectedEngine: EngineMode
  detailMode: DetailMode
  onEngineChange: (engine: EngineMode) => void
}

export const EngineSettingsSection = ({
  selectedEngine,
  detailMode,
  onEngineChange,
}: EngineSettingsSectionProps) => (
  <div className="flex flex-col gap-3">
    <SettingSectionHeader title="エンジン選択" description="処理に使うエンジンを選択します。" />
    <div className="grid gap-3 sm:grid-cols-3">
      {ENGINE_CARD_CONFIGS.map((config) => (
        <EngineChoiceCard
          key={config.id}
          config={config}
          isSelected={selectedEngine === config.id}
          detailMode={detailMode}
          onSelect={onEngineChange}
        />
      ))}
    </div>
  </div>
)
