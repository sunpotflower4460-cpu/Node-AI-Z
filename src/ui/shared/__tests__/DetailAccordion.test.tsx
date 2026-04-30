import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { DetailAccordion } from '../DetailAccordion'

describe('DetailAccordion', () => {
  it('renders summary text', () => {
    const html = renderToString(
      createElement(DetailAccordion, { summary: 'Raw Scores' }, 'Content')
    )
    expect(html).toContain('Raw Scores')
  })

  it('is collapsed by default', () => {
    const html = renderToString(
      createElement(DetailAccordion, { summary: 'Details', defaultOpen: false }, 'Hidden content')
    )
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Hidden content')
  })

  it('shows content when defaultOpen is true', () => {
    const html = renderToString(
      createElement(DetailAccordion, { summary: 'Details', defaultOpen: true }, 'Visible content')
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Visible content')
  })
})
