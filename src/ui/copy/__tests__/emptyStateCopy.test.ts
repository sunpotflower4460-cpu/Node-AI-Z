import { describe, expect, it } from 'vitest'
import { EMPTY_STATE_COPY, getEmptyStateCopy } from '../emptyStateCopy'
import type { TabId } from '../tabCopy'

const PRIMARY_TABS: TabId[] = ['field', 'growth', 'teacher', 'mother', 'risk', 'history']

describe('EMPTY_STATE_COPY', () => {
  it('has entries for all primary tabs', () => {
    for (const tab of PRIMARY_TABS) {
      expect(EMPTY_STATE_COPY[tab]).toBeDefined()
    }
  })

  it('each entry has title and description', () => {
    for (const tab of PRIMARY_TABS) {
      expect(EMPTY_STATE_COPY[tab].title.length).toBeGreaterThan(0)
      expect(EMPTY_STATE_COPY[tab].description.length).toBeGreaterThan(0)
    }
  })

  it('field tab empty state mentions Analyze', () => {
    expect(EMPTY_STATE_COPY.field.description).toContain('Analyze')
  })

  it('growth tab empty state describes first growth', () => {
    expect(EMPTY_STATE_COPY.growth.description).toContain('assembly')
  })

  it('teacher tab empty state explains first bridge', () => {
    expect(EMPTY_STATE_COPY.teacher.description).toContain('橋')
  })

  it('mother tab empty state mentions Node Mother as candidate', () => {
    expect(EMPTY_STATE_COPY.mother.description).toContain('Node Mother')
    expect(EMPTY_STATE_COPY.mother.description).toContain('候補')
  })
})

describe('getEmptyStateCopy', () => {
  it('returns correct entry', () => {
    const entry = getEmptyStateCopy('growth')
    expect(entry.title).toContain('成長')
  })
})
