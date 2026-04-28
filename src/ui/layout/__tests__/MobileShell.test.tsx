import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MobileShell } from '../MobileShell'

describe('MobileShell', () => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'field', label: 'Field' },
  ]

  it('renders mode and stage in header', () => {
    const html = renderToString(
      createElement(MobileShell, {
        mode: 'New Signal Mode',
        stage: 'Stage 2',
        riskLevel: 'low',
        tabs,
        activeTab: 'overview',
        onTabChange: () => {},
        children: createElement('div', null, 'content'),
      })
    )
    expect(html).toContain('New Signal Mode')
    expect(html).toContain('Stage 2')
  })

  it('renders children', () => {
    const html = renderToString(
      createElement(MobileShell, {
        mode: 'Signal',
        stage: 'Stage 1',
        tabs,
        activeTab: 'overview',
        onTabChange: () => {},
        children: createElement('p', null, 'Hello World'),
      })
    )
    expect(html).toContain('Hello World')
  })
})
