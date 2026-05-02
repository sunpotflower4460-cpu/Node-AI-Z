import { describe, expect, it } from 'vitest'
import { createUiReviewSession } from '../createUiReviewSession'
import type { UiAuditReport } from '../../audit/uiAuditTypes'
import type { UiFixPlan } from '../../auditFix/uiAuditFixTypes'

const makeReport = (): UiAuditReport => ({
  createdAt: 1000000,
  overallStatus: 'warning',
  overallScore: 72,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: 'warning',
      score: 75,
      checks: [],
      summary: '',
    },
  ],
  topWarnings: ['Home: 0件カードが多い', 'Analyze: 結果要約なし'],
  recommendedNextFixes: [],
})

const makeFixPlan = (): UiFixPlan => ({
  createdAt: 2000000,
  sourceAuditScore: 72,
  overallPriority: 'p1',
  candidates: [],
  prPlans: [
    {
      id: 'pr1',
      title: 'Home改善',
      summary: '',
      priority: 'p1',
      candidates: [],
      suggestedBranchName: 'ui/home-fix',
      copilotPrompt: 'Fix home screen',
    },
  ],
  summary: '改善候補が見つかりました',
})

describe('createUiReviewSession', () => {
  it('creates a session from an audit report', () => {
    const session = createUiReviewSession(makeReport())
    expect(session.id).toMatch(/^rev_/)
    expect(session.initialAuditScore).toBe(72)
    expect(session.initialTopWarnings).toHaveLength(2)
    expect(session.status).toBe('audit_only')
  })

  it('sets fix_plan_created status when fix plan is provided', () => {
    const session = createUiReviewSession(makeReport(), makeFixPlan())
    expect(session.status).toBe('fix_plan_created')
    expect(session.fixPlanId).toBeDefined()
    expect(session.fixPlanTitles).toContain('Home改善')
  })

  it('sets createdAt and updatedAt', () => {
    const session = createUiReviewSession(makeReport())
    expect(typeof session.createdAt).toBe('number')
    expect(typeof session.updatedAt).toBe('number')
  })

  it('sets summary string', () => {
    const session = createUiReviewSession(makeReport())
    expect(session.summary.length).toBeGreaterThan(0)
    expect(session.summary).toContain('72')
  })
})
