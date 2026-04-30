import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CompactMetricStrip } from '../CompactMetricStrip'
import type { CompactMetricItem } from '../CompactMetricStrip'

describe('CompactMetricStrip', () => {
  const metrics: CompactMetricItem[] = [
    { id: 'a', label: '成長した点群', value: 3, helper: 'テスト', status: 'good' },
    { id: 'b', label: '結びつき', value: 0, helper: 'テスト', status: 'empty' },
    { id: 'c', label: '意味の種', researchLabel: 'Proto Seeds', value: 1, helper: 'テスト', status: 'normal' },
  ]

  it('renders metric labels', () => {
    const html = renderToString(
      createElement(CompactMetricStrip, { metrics, researchMode: false })
    )

    expect(html).toContain('成長した点群')
    expect(html).toContain('結びつき')
  })

  it('shows Japanese labels in simple mode', () => {
    const html = renderToString(
      createElement(CompactMetricStrip, { metrics, researchMode: false })
    )
    expect(html).toContain('意味の種')
    expect(html).not.toContain('Proto Seeds')
  })

  it('shows research labels in research mode', () => {
    const html = renderToString(
      createElement(CompactMetricStrip, { metrics, researchMode: true })
    )
    expect(html).toContain('Proto Seeds')
  })

  it('renders metric values', () => {
    const html = renderToString(
      createElement(CompactMetricStrip, { metrics, researchMode: false })
    )
    expect(html).toContain('3')
    expect(html).toContain('0')
  })
})
