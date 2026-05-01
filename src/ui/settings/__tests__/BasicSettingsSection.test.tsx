import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { BasicSettingsSection } from '../BasicSettingsSection'

const defaultProps = {
  screenMode: 'observe' as const,
  engine: 'signal_mode' as const,
  detailMode: 'simple' as const,
  onScreenModeChange: () => undefined,
  onEngineChange: () => undefined,
  onDetailModeChange: () => undefined,
}

describe('BasicSettingsSection', () => {
  it('renders screen mode buttons', () => {
    const html = renderToString(BasicSettingsSection(defaultProps))
    expect(html).toContain('観察')
    expect(html).toContain('体験')
  })

  it('renders engine buttons', () => {
    const html = renderToString(BasicSettingsSection(defaultProps))
    expect(html).toContain('New Signal')
    expect(html).toContain('Legacy')
    expect(html).toContain('LLM')
  })

  it('renders detail mode buttons', () => {
    const html = renderToString(BasicSettingsSection(defaultProps))
    expect(html).toContain('Simple')
    expect(html).toContain('Research')
  })

  it('marks observe as active when screenMode is observe', () => {
    const html = renderToString(BasicSettingsSection({ ...defaultProps, screenMode: 'observe' }))
    expect(html).toContain('aria-pressed="true"')
  })

  it('renders section header', () => {
    const html = renderToString(BasicSettingsSection(defaultProps))
    expect(html).toContain('基本設定')
  })
})
