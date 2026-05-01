import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiFixCandidateCard } from '../UiFixCandidateCard'
import type { UiFixCandidate } from '../uiAuditFixTypes'

const candidate: UiFixCandidate = {
  id: 'test-c1',
  sourceScreenId: 'home',
  sourceCheckId: 'check-1',
  category: 'first_screen',
  title: 'Home: 0値カード整理',
  problem: '0値カードが多い',
  recommendedFix: '折りたたみへ移動',
  priority: 'p0',
  impact: 'high',
  effort: 'small',
  affectedFilesHint: ['src/ui/overview/GrowthMetricCards.tsx'],
  acceptanceCriteria: ['0値カードが折りたたまれる'],
}

describe('UiFixCandidateCard', () => {
  it('renders the title', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('Home: 0値カード整理')
  })

  it('renders the priority badge', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('P0')
  })

  it('renders the problem', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('0値カードが多い')
  })

  it('renders the recommended fix', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('折りたたみへ移動')
  })

  it('renders affected files', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('GrowthMetricCards.tsx')
  })

  it('renders acceptance criteria', () => {
    const html = renderToString(createElement(UiFixCandidateCard, { candidate }))
    expect(html).toContain('0値カードが折りたたまれる')
  })
})
