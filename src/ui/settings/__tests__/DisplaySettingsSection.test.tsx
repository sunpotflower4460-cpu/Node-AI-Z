import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DisplaySettingsSection } from '../DisplaySettingsSection'

const defaultSettings = {
  preferJapaneseLabels: false,
  compactCards: false,
  showRawIds: false,
  showDebugBadges: false,
}

const defaultProps = {
  settings: defaultSettings,
  detailMode: 'simple' as const,
  onChange: () => undefined,
}

describe('DisplaySettingsSection', () => {
  it('renders basic display toggles', () => {
    const html = renderToString(DisplaySettingsSection(defaultProps))
    expect(html).toContain('日本語ラベル優先')
    expect(html).toContain('Compact Cards')
  })

  it('hides research toggles in simple mode', () => {
    const html = renderToString(DisplaySettingsSection(defaultProps))
    expect(html).not.toContain('Show raw IDs')
    expect(html).not.toContain('Show debug badges')
  })

  it('shows research toggles in research mode', () => {
    const html = renderToString(
      DisplaySettingsSection({ ...defaultProps, detailMode: 'research' })
    )
    expect(html).toContain('Show raw IDs')
    expect(html).toContain('Show debug badges')
  })

  it('renders section header', () => {
    const html = renderToString(DisplaySettingsSection(defaultProps))
    expect(html).toContain('表示設定')
  })

  it('reflects checked state for toggles', () => {
    const html = renderToString(
      DisplaySettingsSection({
        ...defaultProps,
        settings: { ...defaultSettings, preferJapaneseLabels: true },
      })
    )
    expect(html).toContain('aria-checked="true"')
  })
})
