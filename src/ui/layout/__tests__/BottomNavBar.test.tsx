import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { BottomNavBar } from '../BottomNavBar'

describe('BottomNavBar', () => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'field', label: 'Field' },
    { id: 'growth', label: 'Growth' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'evaluate', label: 'Evaluate' },
  ]

  it('renders all primary tabs', () => {
    const html = renderToString(
      createElement(BottomNavBar, {
        tabs,
        activeTab: 'overview',
        onTabChange: () => {},
      })
    )
    expect(html).toContain('Overview')
    expect(html).toContain('Field')
    expect(html).toContain('Growth')
  })

  it('marks active tab with aria-pressed=true', () => {
    const html = renderToString(
      createElement(BottomNavBar, {
        tabs,
        activeTab: 'field',
        onTabChange: () => {},
      })
    )
    expect(html).toContain('aria-pressed="true"')
  })

  it('shows More when tabs exceed 5', () => {
    const moreTabs = [
      ...tabs,
      { id: 'risk', label: 'Risk' },
      { id: 'history', label: 'History' },
    ]
    const html = renderToString(
      createElement(BottomNavBar, {
        tabs: moreTabs,
        activeTab: 'overview',
        onTabChange: () => {},
      })
    )
    expect(html).toContain('More')
  })
})
