import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MobileFieldPanels } from '../MobileFieldPanels'

describe('MobileFieldPanels', () => {
  it('renders empty state when source is null', () => {
    const html = renderToString(
      createElement(MobileFieldPanels, { source: null, detailMode: 'simple' })
    )
    expect(html).toContain('Signal Field')
  })
})
