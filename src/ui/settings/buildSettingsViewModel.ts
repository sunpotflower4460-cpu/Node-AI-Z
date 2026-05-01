import type { ScreenMode, EngineMode, DetailMode, SettingsViewModel } from './types/settingsUiTypes'

type BuildSettingsViewModelParams = {
  screenMode: ScreenMode
  engine: EngineMode
  detailMode: DetailMode
  hasSnapshot?: boolean
  lastSavedAt?: number | null
  autosaveEnabled?: boolean
  debugTraceEnabled?: boolean
  rawMetricsVisible?: boolean
  ablationVisible?: boolean
}

const SCREEN_MODE_LABELS: Record<ScreenMode, string> = {
  observe: '観察',
  experience: '体験',
}

const ENGINE_LABELS: Record<EngineMode, string> = {
  signal_mode: 'New Signal',
  crystallized_legacy: 'Legacy',
  llm_mode: 'LLM',
}

const DETAIL_MODE_LABELS: Record<DetailMode, string> = {
  simple: 'Simple',
  research: 'Research',
}

function buildLastSavedLabel(lastSavedAt?: number | null): string {
  if (lastSavedAt == null) return 'なし'
  return new Date(lastSavedAt).toLocaleString('ja-JP')
}

export function buildSettingsViewModel(params: BuildSettingsViewModelParams): SettingsViewModel {
  const {
    screenMode,
    engine,
    detailMode,
    hasSnapshot = false,
    lastSavedAt = null,
    autosaveEnabled = false,
    debugTraceEnabled = false,
    rawMetricsVisible = false,
    ablationVisible = false,
  } = params

  return {
    screenMode,
    engine,
    detailMode,
    labels: {
      screenModeLabel: SCREEN_MODE_LABELS[screenMode],
      engineLabel: ENGINE_LABELS[engine],
      detailModeLabel: DETAIL_MODE_LABELS[detailMode],
    },
    storage: {
      hasSnapshot,
      lastSavedLabel: buildLastSavedLabel(lastSavedAt),
      autosaveEnabled,
    },
    research: {
      debugTraceEnabled,
      rawMetricsVisible,
      ablationVisible,
    },
  }
}
