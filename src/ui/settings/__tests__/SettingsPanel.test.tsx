import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SettingsPanel } from '../SettingsPanel'

const defaultProps = {
  screenMode: 'observe' as const,
  engine: 'signal_mode' as const,
  detailMode: 'simple' as const,
  displaySettings: {
    preferJapaneseLabels: false,
    compactCards: false,
    showRawIds: false,
    showDebugBadges: false,
  },
  researchSettings: {
    debugTrace: false,
    rawMetrics: false,
    ablation: false,
  },
  storageSettings: {
    hasSnapshot: false,
    lastSavedLabel: 'なし',
    autosaveEnabled: false,
  },
  onScreenModeChange: () => undefined,
  onEngineChange: () => undefined,
  onDetailModeChange: () => undefined,
  onDisplaySettingsChange: () => undefined,
  onResearchSettingsChange: () => undefined,
  onAutosaveChange: () => undefined,
  onSaveNow: () => undefined,
  onRestore: () => undefined,
  onResetSignalMode: () => undefined,
  onClearSnapshots: () => undefined,
  onClearScenarioResults: () => undefined,
  onClearUiPreferences: () => undefined,
}

describe('SettingsPanel', () => {
  it('renders without crashing in simple mode', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('設定')
  })

  it('renders screen mode buttons', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('観察')
    expect(html).toContain('体験')
  })

  it('renders engine buttons', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('New Signal')
    expect(html).toContain('Legacy')
    expect(html).toContain('LLM')
  })

  it('renders detail mode toggle', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('Simple')
    expect(html).toContain('Research')
  })

  it('renders storage section with last saved label', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('なし')
    expect(html).toContain('今すぐ保存')
    expect(html).toContain('復元')
  })

  it('renders Danger Zone section', () => {
    const html = renderToString(SettingsPanel(defaultProps))
    expect(html).toContain('Danger Zone')
  })

  it('shows engine cards in research mode', () => {
    const html = renderToString(
      SettingsPanel({ ...defaultProps, detailMode: 'research' })
    )
    expect(html).toContain('意味未満の点群')
  })
})
