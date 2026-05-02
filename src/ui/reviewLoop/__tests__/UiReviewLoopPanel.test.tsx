import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiReviewLoopPanel } from '../UiReviewLoopPanel'

describe('UiReviewLoopPanel', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(UiReviewLoopPanel))
    expect(html).toContain('UI Review Loop')
  })

  it('shows audit score', () => {
    const html = renderToString(createElement(UiReviewLoopPanel))
    expect(html).toContain('Current Audit Score')
  })

  it('shows next suggestion', () => {
    const html = renderToString(createElement(UiReviewLoopPanel))
    expect(html).toContain('次のおすすめ改善')
  })
})
