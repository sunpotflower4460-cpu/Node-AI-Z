import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { StickyTabHeader } from '../StickyTabHeader'

describe('StickyTabHeader', () => {
  it('renders tabLabel', () => {
    const html = renderToString(
      createElement(StickyTabHeader, { tabLabel: '概要' })
    )
    expect(html).toContain('概要')
  })

  it('renders all parts when provided', () => {
    const html = renderToString(
      createElement(StickyTabHeader, {
        tabLabel: '成長',
        engineLabel: 'New Signal',
        stageLabel: 'Stage 1',
        riskLabel: 'Risk Low',
      })
    )
    expect(html).toContain('成長')
    expect(html).toContain('New Signal')
    expect(html).toContain('Stage 1')
    expect(html).toContain('Risk Low')
  })

  it('renders separator between parts', () => {
    const html = renderToString(
      createElement(StickyTabHeader, {
        tabLabel: '概要',
        engineLabel: 'New Signal',
      })
    )
    expect(html).toContain('｜')
  })
})
