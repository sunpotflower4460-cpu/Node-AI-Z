import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiFixPrPlanCard } from '../UiFixPrPlanCard'
import type { UiFixPrPlan } from '../uiAuditFixTypes'

const plan: UiFixPrPlan = {
  id: 'pr-home',
  title: 'Home / 初期画面の整理',
  summary: '初期画面の改善',
  priority: 'p0',
  candidates: [
    {
      id: 'c1',
      sourceScreenId: 'home',
      sourceCheckId: 'check-1',
      category: 'first_screen',
      title: '0値カード整理',
      problem: '0値カードが多い',
      recommendedFix: '折りたたみ',
      priority: 'p0',
      impact: 'high',
      effort: 'small',
      affectedFilesHint: [],
      acceptanceCriteria: [],
    },
  ],
  suggestedBranchName: 'fix/ui-home-first-screen',
  copilotPrompt: '# Task\nHome fix\n\n# Do\nfix stuff\n\n# Do Not\nno auto merge\n\n# Acceptance Criteria\n- done',
}

describe('UiFixPrPlanCard', () => {
  it('renders the plan title', () => {
    const html = renderToString(createElement(UiFixPrPlanCard, { plan }))
    expect(html).toContain('Home / 初期画面の整理')
  })

  it('renders the priority badge', () => {
    const html = renderToString(createElement(UiFixPrPlanCard, { plan }))
    expect(html).toContain('P0')
  })

  it('renders the branch name', () => {
    const html = renderToString(createElement(UiFixPrPlanCard, { plan }))
    expect(html).toContain('fix/ui-home-first-screen')
  })

  it('renders the copy button', () => {
    const html = renderToString(createElement(UiFixPrPlanCard, { plan }))
    expect(html).toContain('指示書をコピー')
  })

  it('renders candidate titles', () => {
    const html = renderToString(createElement(UiFixPrPlanCard, { plan }))
    expect(html).toContain('0値カード整理')
  })
})
