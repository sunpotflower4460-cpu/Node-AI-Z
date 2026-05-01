import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EngineSettingsSection } from '../EngineSettingsSection'

const defaultProps = {
  selectedEngine: 'signal_mode' as const,
  detailMode: 'simple' as const,
  onEngineChange: () => undefined,
}

describe('EngineSettingsSection', () => {
  it('renders all three engine cards', () => {
    const html = renderToString(EngineSettingsSection(defaultProps))
    expect(html).toContain('New Signal')
    expect(html).toContain('Legacy')
    expect(html).toContain('LLM')
  })

  it('marks selected engine card as pressed', () => {
    const html = renderToString(EngineSettingsSection(defaultProps))
    expect(html).toContain('aria-pressed="true"')
  })

  it('shows short descriptions in simple mode', () => {
    const html = renderToString(EngineSettingsSection({ ...defaultProps, detailMode: 'simple' }))
    expect(html).toContain('意味未満の点群から育つ新しい結晶思考。')
  })

  it('shows internal IDs in research mode', () => {
    const html = renderToString(EngineSettingsSection({ ...defaultProps, detailMode: 'research' }))
    expect(html).toContain('signal_mode')
    expect(html).toContain('crystallized_legacy')
    expect(html).toContain('llm_mode')
  })

  it('renders badge text', () => {
    const html = renderToString(EngineSettingsSection(defaultProps))
    expect(html).toContain('現在の主開発対象')
    expect(html).toContain('旧系統')
    expect(html).toContain('比較用')
  })

  it('renders section header', () => {
    const html = renderToString(EngineSettingsSection(defaultProps))
    expect(html).toContain('エンジン選択')
  })
})
