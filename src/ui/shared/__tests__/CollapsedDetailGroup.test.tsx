import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CollapsedDetailGroup } from '../CollapsedDetailGroup'

describe('CollapsedDetailGroup', () => {
  it('renders the label', () => {
    const html = renderToString(
      createElement(CollapsedDetailGroup, { label: '詳細を見る' }, 'Hidden content')
    )
    expect(html).toContain('詳細を見る')
  })

  it('is collapsed by default', () => {
    const html = renderToString(
      createElement(CollapsedDetailGroup, { label: '詳細を見る' }, 'Hidden content')
    )
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Hidden content')
  })

  it('shows content when defaultOpen is true', () => {
    const html = renderToString(
      createElement(CollapsedDetailGroup, { label: '詳細を見る', defaultOpen: true }, 'Visible content')
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Visible content')
  })

  it('uses default label when label prop is omitted', () => {
    const html = renderToString(
      createElement(CollapsedDetailGroup, null, 'Content')
    )
    expect(html).toContain('詳細を見る')
  })
})
