import { describe, expect, it } from 'vitest'
import { PRIMARY_TABS } from '../tabDisplayConfig'

describe('tabDisplayConfig', () => {
  it('exports 8 primary tabs', () => {
    expect(PRIMARY_TABS).toHaveLength(8)
  })

  it('contains expected tab ids', () => {
    const ids = PRIMARY_TABS.map((tab) => tab.id)
    expect(ids).toContain('overview')
    expect(ids).toContain('field')
    expect(ids).toContain('growth')
    expect(ids).toContain('teacher')
    expect(ids).toContain('evaluate')
    expect(ids).toContain('risk')
    expect(ids).toContain('history')
    expect(ids).toContain('mother')
  })

  it('provides Japanese labels in Simple View', () => {
    const tab = PRIMARY_TABS.find((t) => t.id === 'overview')
    expect(tab?.label).toBe('概要')
  })

  it('provides English labels in Research View', () => {
    const tab = PRIMARY_TABS.find((t) => t.id === 'overview')
    expect(tab?.researchLabel).toBe('Overview')
  })

  it('mother tab has same label in both modes', () => {
    const tab = PRIMARY_TABS.find((t) => t.id === 'mother')
    expect(tab?.label).toBe('Mother')
    expect(tab?.researchLabel).toBe('Mother')
  })
})
