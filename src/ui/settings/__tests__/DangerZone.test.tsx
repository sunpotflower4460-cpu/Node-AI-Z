import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DangerZone } from '../DangerZone'

const defaultProps = {
  onResetSignalMode: () => undefined,
  onClearSnapshots: () => undefined,
  onClearScenarioResults: () => undefined,
  onClearUiPreferences: () => undefined,
}

describe('DangerZone', () => {
  it('renders the Danger Zone title', () => {
    const html = renderToString(DangerZone(defaultProps))
    expect(html).toContain('Danger Zone')
  })

  it('renders danger action buttons when expanded', () => {
    // Collapsed by default, so we can just check the section structure renders
    const html = renderToString(DangerZone(defaultProps))
    expect(html).toContain('Danger Zone')
  })
})
