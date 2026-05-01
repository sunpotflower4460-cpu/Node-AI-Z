import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { ScreenAuditCard } from '../ScreenAuditCard'
import type { ScreenAuditResult } from '../uiAuditTypes'

const result: ScreenAuditResult = {
  screenId: 'home',
  screenLabel: 'Home',
  status: 'pass',
  score: 90,
  checks: [],
  summary: 'All good',
}

describe('ScreenAuditCard', () => {
  it('renders screen label and score', () => {
    const html = renderToString(createElement(ScreenAuditCard, { result }))
    expect(html).toContain('Home')
    expect(html).toContain('90')
    expect(html).toContain('All good')
  })
})
