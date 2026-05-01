import { describe, expect, it } from 'vitest'
import { buildUiFixPlan } from '../buildUiFixPlan'
import type { UiAuditReport } from '../../audit/uiAuditTypes'

const makeReport = (): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: 'warning',
  overallScore: 72,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: 'warning',
      score: 75,
      checks: [
        {
          id: 'home-no-zero-flood',
          label: '0件カードが大量に並んでいない',
          description: '空状態のメトリクスカードが多すぎない',
          status: 'warning',
          severity: 'medium',
          recommendation: '0値メトリクスカードを折りたたみ表示にすることを検討してください',
        },
      ],
      summary: '',
    },
    {
      screenId: 'analyze',
      screenLabel: 'Analyze Flow',
      status: 'warning',
      score: 70,
      checks: [
        {
          id: 'analyze-result-clear',
          label: '結果要約が表示される',
          description: 'Analyze完了後に要約が表示される',
          status: 'warning',
          severity: 'high',
        },
      ],
      summary: '',
    },
  ],
  topWarnings: [],
  recommendedNextFixes: [],
})

describe('buildUiFixPlan', () => {
  it('returns a UiFixPlan with candidates', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(plan.candidates.length).toBeGreaterThan(0)
  })

  it('returns a UiFixPlan with prPlans', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(plan.prPlans.length).toBeGreaterThan(0)
  })

  it('sets sourceAuditScore from report', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(plan.sourceAuditScore).toBe(72)
  })

  it('sets overallPriority', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(['p0', 'p1', 'p2']).toContain(plan.overallPriority)
  })

  it('sets summary string', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(plan.summary.length).toBeGreaterThan(0)
  })

  it('sets createdAt as a number', () => {
    const plan = buildUiFixPlan(makeReport())
    expect(typeof plan.createdAt).toBe('number')
  })

  it('each prPlan has a copilotPrompt', () => {
    const plan = buildUiFixPlan(makeReport())
    for (const prPlan of plan.prPlans) {
      expect(prPlan.copilotPrompt.length).toBeGreaterThan(0)
    }
  })
})
