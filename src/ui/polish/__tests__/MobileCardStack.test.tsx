import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MobileCardStack } from '../MobileCardStack'

describe('MobileCardStack', () => {
  it('renders children', () => {
    const html = renderToString(
      createElement(MobileCardStack, { label: 'テストスタック' },
        createElement('div', null, 'Card1'),
        createElement('div', null, 'Card2')
      )
    )
    expect(html).toContain('Card1')
    expect(html).toContain('Card2')
  })

  it('sets aria-label when provided', () => {
    const html = renderToString(
      createElement(MobileCardStack, { label: 'メインセクション' },
        createElement('div', null, 'Content')
      )
    )
    expect(html).toContain('aria-label="メインセクション"')
  })
})
