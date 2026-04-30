import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AnalyzeResultSummary } from '../AnalyzeResultSummary'
import type { AnalyzeResultSummaryViewModel } from '../../viewModels/buildAnalyzeResultSummaryViewModel'

const emptyViewModel: AnalyzeResultSummaryViewModel = {
  hasResult: false,
  headline: '',
  summaryText: '',
  deltas: [],
  stageChanged: false,
  riskChanged: false,
  recommendedTabs: [],
}

const fullViewModel: AnalyzeResultSummaryViewModel = {
  hasResult: true,
  headline: '今回の観察結果',
  summaryText: 'baseline が作られました。',
  deltas: [
    { id: 'assembly', label: '点群 変化なし', value: '変化なし', tone: 'neutral' },
  ],
  stageChanged: false,
  riskChanged: false,
  recommendedTabs: [
    { tabId: 'field', label: '発火を見る', reason: '点群の反応を確認できます。' },
  ],
}

describe('AnalyzeResultSummary', () => {
  it('renders nothing when hasResult is false', () => {
    const html = renderToString(<AnalyzeResultSummary viewModel={emptyViewModel} onTabChange={() => {}} />)
    expect(html).toBe('')
  })

  it('renders headline when hasResult is true', () => {
    const html = renderToString(<AnalyzeResultSummary viewModel={fullViewModel} onTabChange={() => {}} />)
    expect(html).toContain('今回の観察結果')
  })

  it('renders summary text', () => {
    const html = renderToString(<AnalyzeResultSummary viewModel={fullViewModel} onTabChange={() => {}} />)
    expect(html).toContain('baseline が作られました')
  })

  it('renders recommended tab button', () => {
    const html = renderToString(<AnalyzeResultSummary viewModel={fullViewModel} onTabChange={() => {}} />)
    expect(html).toContain('発火を見る')
  })
})
