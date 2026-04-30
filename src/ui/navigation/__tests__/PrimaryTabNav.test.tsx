import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { PrimaryTabNav } from '../PrimaryTabNav'

describe('PrimaryTabNav', () => {
  it('renders all 8 primary tabs', () => {
    const html = renderToString(
      createElement(PrimaryTabNav, {
        activeTab: 'overview',
        researchMode: false,
        onTabChange: () => undefined,
      })
    )

    expect(html).toContain('概要')
    expect(html).toContain('発火')
    expect(html).toContain('成長')
    expect(html).toContain('先生')
    expect(html).toContain('検証')
    expect(html).toContain('リスク')
    expect(html).toContain('履歴')
    expect(html).toContain('Mother')
  })

  it('marks the active tab with aria-selected', () => {
    const html = renderToString(
      createElement(PrimaryTabNav, {
        activeTab: 'growth',
        researchMode: false,
        onTabChange: () => undefined,
      })
    )

    expect(html).toContain('aria-selected="true"')
  })

  it('renders English labels in research mode', () => {
    const html = renderToString(
      createElement(PrimaryTabNav, {
        activeTab: 'overview',
        researchMode: true,
        onTabChange: () => undefined,
      })
    )

    expect(html).toContain('Overview')
    expect(html).toContain('Growth')
    expect(html).toContain('Risk')
  })
})
