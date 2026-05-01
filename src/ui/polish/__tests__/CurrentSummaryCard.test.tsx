import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CurrentSummaryCard } from '../CurrentSummaryCard'
import type { CurrentSummaryViewModel } from '../buildCurrentSummaryViewModel'

const BASE_VM: CurrentSummaryViewModel = {
  title: '現在の状態',
  subtitle: '新しい信号モード / Stage 1',
  engineLabel: '新しい信号モード',
  stageLabel: 'Stage 1',
  riskLabel: '落ち着いています',
  growthSummary: '点群 0 / 結びつき 0 / 意味の種 0',
  nextAction: 'まず文章を入力して Analyze してください。',
}

describe('CurrentSummaryCard', () => {
  it('renders title and subtitle', () => {
    const html = renderToString(createElement(CurrentSummaryCard, { viewModel: BASE_VM }))
    expect(html).toContain('現在の状態')
    expect(html).toContain('新しい信号モード / Stage 1')
  })

  it('renders next action text', () => {
    const html = renderToString(createElement(CurrentSummaryCard, { viewModel: BASE_VM }))
    expect(html).toContain('Analyze してください')
  })

  it('renders risk label', () => {
    const html = renderToString(createElement(CurrentSummaryCard, { viewModel: BASE_VM }))
    expect(html).toContain('落ち着いています')
  })

  it('renders research details when provided', () => {
    const vm: CurrentSummaryViewModel = {
      ...BASE_VM,
      details: [
        { label: 'engine', value: 'signal_mode' },
        { label: 'stage', value: 'stage_1_ignition' },
      ],
    }
    const html = renderToString(createElement(CurrentSummaryCard, { viewModel: vm }))
    expect(html).toContain('詳しく見る')
  })

  it('does not render research section when details is undefined', () => {
    const html = renderToString(createElement(CurrentSummaryCard, { viewModel: BASE_VM }))
    expect(html).not.toContain('詳しく見る')
  })
})
