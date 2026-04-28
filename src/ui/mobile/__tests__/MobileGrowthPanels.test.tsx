import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MobileGrowthPanels } from '../MobileGrowthPanels'

describe('MobileGrowthPanels', () => {
  it('renders empty state when source is null', () => {
    const html = renderToString(
      createElement(MobileGrowthPanels, { source: null, detailMode: 'simple' })
    )
    expect(html).toContain('assembly')
  })
})
