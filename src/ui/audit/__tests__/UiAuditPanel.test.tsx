import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiAuditPanel } from '../UiAuditPanel'

describe('UiAuditPanel', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(UiAuditPanel))
    expect(html).toContain('UI Clarity Audit')
  })

  it('shows overall score', () => {
    const html = renderToString(createElement(UiAuditPanel))
    expect(html).toContain('Score:')
  })
})
