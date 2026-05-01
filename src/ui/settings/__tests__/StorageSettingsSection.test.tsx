import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { StorageSettingsSection } from '../StorageSettingsSection'

const defaultProps = {
  hasSnapshot: false,
  lastSavedLabel: 'なし',
  autosaveEnabled: false,
  onAutosaveChange: () => undefined,
  onSaveNow: () => undefined,
  onRestore: () => undefined,
}

describe('StorageSettingsSection', () => {
  it('renders last saved label', () => {
    const html = renderToString(StorageSettingsSection(defaultProps))
    expect(html).toContain('なし')
  })

  it('renders save and restore buttons', () => {
    const html = renderToString(StorageSettingsSection(defaultProps))
    expect(html).toContain('今すぐ保存')
    expect(html).toContain('復元')
  })

  it('renders autosave toggle', () => {
    const html = renderToString(StorageSettingsSection(defaultProps))
    expect(html).toContain('Autosave')
    expect(html).toContain('role="switch"')
  })

  it('shows autosave as enabled when prop is true', () => {
    const html = renderToString(
      StorageSettingsSection({ ...defaultProps, autosaveEnabled: true })
    )
    expect(html).toContain('aria-checked="true"')
  })

  it('renders disclaimer note', () => {
    const html = renderToString(StorageSettingsSection(defaultProps))
    expect(html).toContain('New Signal Mode')
  })

  it('renders with custom lastSavedLabel', () => {
    const html = renderToString(
      StorageSettingsSection({ ...defaultProps, lastSavedLabel: '2024/1/15 10:30:00' })
    )
    expect(html).toContain('2024/1/15 10:30:00')
  })
})
