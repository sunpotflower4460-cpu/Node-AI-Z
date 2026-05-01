import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { HelpPopover } from '../HelpPopover'

describe('HelpPopover', () => {
  it('renders the help icon button', () => {
    const html = renderToString(
      createElement(HelpPopover, {
        term: '発火',
        definition: '入力に反応して点群が強くなること。',
      })
    )
    expect(html).toContain('aria-label')
    expect(html).toContain('発火')
  })

  it('renders aria-label with term', () => {
    const html = renderToString(
      createElement(HelpPopover, {
        term: '結びつき',
        definition: '点群同士のあいだにできた再利用できる橋。',
        researchNote: 'bridge',
      })
    )
    expect(html).toContain('結びつき')
  })
})
