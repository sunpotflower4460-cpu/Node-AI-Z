import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CopyFixPromptButton } from '../CopyFixPromptButton'

describe('CopyFixPromptButton', () => {
  it('renders with default label', () => {
    const html = renderToString(createElement(CopyFixPromptButton, { prompt: 'test prompt' }))
    expect(html).toContain('指示書をコピー')
  })

  it('renders with custom label', () => {
    const html = renderToString(createElement(CopyFixPromptButton, { prompt: 'test', label: 'カスタムコピー' }))
    expect(html).toContain('カスタムコピー')
  })

  it('renders a button element', () => {
    const html = renderToString(createElement(CopyFixPromptButton, { prompt: 'test prompt' }))
    expect(html).toContain('<button')
  })
})
