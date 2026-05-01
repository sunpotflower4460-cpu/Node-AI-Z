export type ScreenMode = 'observe' | 'experience'
export type EngineMode = 'signal_mode' | 'crystallized_legacy' | 'llm_mode'
export type DetailMode = 'simple' | 'research'

export type SettingsViewModel = {
  screenMode: ScreenMode
  engine: EngineMode
  detailMode: DetailMode
  labels: {
    screenModeLabel: string
    engineLabel: string
    detailModeLabel: string
  }
  storage: {
    hasSnapshot: boolean
    lastSavedLabel: string
    autosaveEnabled: boolean
  }
  research: {
    debugTraceEnabled: boolean
    rawMetricsVisible: boolean
    ablationVisible: boolean
  }
}
