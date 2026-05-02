import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiReviewSessionCard } from '../UiReviewSessionCard'
import type { UiReviewSession } from '../uiReviewLoopTypes'

const makeSession = (overrides: Partial<UiReviewSession> = {}): UiReviewSession => ({
  id: 'rev_001',
  createdAt: new Date('2026-05-02').getTime(),
  updatedAt: new Date('2026-05-02').getTime(),
  status: 're_audited',
  initialAuditReportId: 'audit_test',
  initialAuditScore: 72,
  initialTopWarnings: [],
  reAuditScore: 84,
  scoreDelta: 12,
  summary: 'UI clarity improved',
  ...overrides,
})

describe('UiReviewSessionCard', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html.length).toBeGreaterThan(0)
  })

  it('shows initial score', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html).toContain('72')
  })

  it('shows re-audit score', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html).toContain('84')
  })

  it('shows positive delta', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html).toContain('+12')
  })

  it('shows status label', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html).toContain('Re-audited')
  })

  it('shows summary', () => {
    const html = renderToString(createElement(UiReviewSessionCard, { session: makeSession() }))
    expect(html).toContain('UI clarity improved')
  })
})
