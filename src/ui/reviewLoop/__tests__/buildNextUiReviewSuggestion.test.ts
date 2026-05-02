import { describe, expect, it } from 'vitest'
import { buildNextUiReviewSuggestion } from '../buildNextUiReviewSuggestion'
import type { UiReviewSession } from '../uiReviewLoopTypes'
import type { UiAuditReport } from '../../audit/uiAuditTypes'

const makeSession = (overrides: Partial<UiReviewSession> = {}): UiReviewSession => ({
  id: 'rev_test',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'audit_only',
  initialAuditReportId: 'audit_test',
  initialAuditScore: 72,
  initialTopWarnings: ['Home / 概要: 0件カードが多い'],
  summary: 'Test session',
  ...overrides,
})

const makeReport = (withFail = false): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: withFail ? 'fail' : 'warning',
  overallScore: 72,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: withFail ? 'fail' : 'warning',
      score: 60,
      checks: [
        {
          id: 'c1',
          label: 'Test check',
          description: '',
          status: withFail ? 'fail' : 'warning',
          severity: 'high',
        },
      ],
      summary: '',
    },
  ],
  topWarnings: [],
  recommendedNextFixes: [],
})

describe('buildNextUiReviewSuggestion', () => {
  it('returns a suggestion when no report is provided', () => {
    const suggestion = buildNextUiReviewSuggestion(makeSession())
    expect(suggestion.priority).toBeDefined()
    expect(suggestion.title.length).toBeGreaterThan(0)
    expect(suggestion.reason.length).toBeGreaterThan(0)
    expect(suggestion.recommendedScope.length).toBeGreaterThan(0)
  })

  it('returns p0 priority when screen has fail status', () => {
    const suggestion = buildNextUiReviewSuggestion(makeSession(), undefined, makeReport(true))
    expect(suggestion.priority).toBe('p0')
    expect(suggestion.title).toContain('Home / 概要')
  })

  it('returns p0 when session has remaining warnings', () => {
    const session = makeSession({ remainingWarnings: ['Home / 概要: 残る課題'] })
    const suggestion = buildNextUiReviewSuggestion(session, undefined, makeReport(false))
    expect(suggestion.priority).toBe('p0')
  })

  it('includes suggestedNextPrompt', () => {
    const suggestion = buildNextUiReviewSuggestion(makeSession(), undefined, makeReport(true))
    expect(suggestion.suggestedNextPrompt).toBeDefined()
    expect(suggestion.suggestedNextPrompt!.length).toBeGreaterThan(0)
  })

  it('returns p2 when no issues', () => {
    const session = makeSession({ remainingWarnings: [] })
    const report: UiAuditReport = {
      createdAt: Date.now(),
      overallStatus: 'pass',
      overallScore: 95,
      screenResults: [
        {
          screenId: 'home',
          screenLabel: 'Home / 概要',
          status: 'pass',
          score: 95,
          checks: [],
          summary: '',
        },
      ],
      topWarnings: [],
      recommendedNextFixes: [],
    }
    const suggestion = buildNextUiReviewSuggestion(session, undefined, report)
    expect(suggestion.priority).toBe('p2')
  })
})
