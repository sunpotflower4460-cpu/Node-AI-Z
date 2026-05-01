import { describe, expect, it } from 'vitest'
import { TAB_COPY, getTabCopy } from '../tabCopy'
import type { TabId } from '../tabCopy'

const EXPECTED_TABS: TabId[] = [
  'overview', 'field', 'growth', 'teacher', 'evaluate', 'risk', 'history', 'mother',
]

describe('TAB_COPY', () => {
  it('has all primary tabs', () => {
    for (const tab of EXPECTED_TABS) {
      expect(TAB_COPY[tab]).toBeDefined()
    }
  })

  it('each tab has a title and description', () => {
    for (const tab of EXPECTED_TABS) {
      expect(TAB_COPY[tab].title.length).toBeGreaterThan(0)
      expect(TAB_COPY[tab].description.length).toBeGreaterThan(0)
    }
  })

  it('overview tab uses Japanese', () => {
    expect(TAB_COPY.overview.title).toBe('概要')
  })

  it('field tab uses Japanese', () => {
    expect(TAB_COPY.field.title).toBe('発火')
  })

  it('growth tab uses Japanese', () => {
    expect(TAB_COPY.growth.title).toBe('成長')
  })

  it('risk tab description mentions 結びつき', () => {
    expect(TAB_COPY.risk.description).toContain('結びつき')
  })

  it('mother tab description mentions Node Mother', () => {
    expect(TAB_COPY.mother.description).toContain('Node Mother')
  })
})

describe('getTabCopy', () => {
  it('returns correct entry', () => {
    const entry = getTabCopy('field')
    expect(entry.title).toBe('発火')
  })
})
