import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MiniMetricBadge } from '../MiniMetricBadge'

describe('MiniMetricBadge', () => {
  it('renders label and value', () => {
    const html = renderToString(
      createElement(MiniMetricBadge, { label: '点群', value: 5 })
    )
    expect(html).toContain('点群')
    expect(html).toContain('5')
  })

  it('applies empty styling when status is empty', () => {
    const html = renderToString(
      createElement(MiniMetricBadge, { label: '点群', value: 0, status: 'empty' })
    )
    expect(html).toContain('text-slate-400')
  })

  it('applies good styling when status is good', () => {
    const html = renderToString(
      createElement(MiniMetricBadge, { label: '点群', value: 10, status: 'good' })
    )
    expect(html).toContain('text-emerald-600')
  })
})
