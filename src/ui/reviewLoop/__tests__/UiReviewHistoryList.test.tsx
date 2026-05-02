import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiReviewHistoryList } from '../UiReviewHistoryList'
import type { UiReviewSession } from '../uiReviewLoopTypes'

const makeSession = (id: string): UiReviewSession => ({
  id,
  createdAt: new Date('2026-05-02').getTime(),
  updatedAt: new Date('2026-05-02').getTime(),
  status: 're_audited',
  initialAuditReportId: 'audit_test',
  initialAuditScore: 72,
  initialTopWarnings: [],
  reAuditScore: 84,
  scoreDelta: 12,
  summary: 'UI clarity improved',
})

describe('UiReviewHistoryList', () => {
  it('shows empty state when no sessions', () => {
    const html = renderToString(createElement(UiReviewHistoryList, { sessions: [] }))
    expect(html).toContain('レビュー履歴がありません')
  })

  it('renders sessions when provided', () => {
    const html = renderToString(
      createElement(UiReviewHistoryList, { sessions: [makeSession('rev_001')] }),
    )
    expect(html).toContain('72')
    expect(html).toContain('84')
  })

  it('renders multiple sessions', () => {
    const html = renderToString(
      createElement(UiReviewHistoryList, {
        sessions: [makeSession('rev_001'), makeSession('rev_002')],
      }),
    )
    expect(html).toContain('Re-audited')
  })
})
