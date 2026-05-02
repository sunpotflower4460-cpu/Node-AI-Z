import { describe, expect, it } from 'vitest'
import { loadUiReviewHistory } from '../loadUiReviewHistory'
import { saveUiReviewHistory } from '../saveUiReviewHistory'
import type { UiReviewStorageAdapter } from '../storage/uiReviewStorageAdapter'
import type { UiReviewSession } from '../uiReviewLoopTypes'

const makeSession = (id: string, createdAt: number = Date.now()): UiReviewSession => ({
  id,
  createdAt,
  updatedAt: createdAt,
  status: 'audit_only',
  initialAuditReportId: 'audit_test',
  initialAuditScore: 72,
  initialTopWarnings: [],
  summary: 'Test session',
})

const makeAdapter = (): UiReviewStorageAdapter => {
  let store: UiReviewSession[] = []
  return {
    save: (sessions) => { store = [...sessions] },
    load: () => [...store],
    clear: () => { store = [] },
  }
}

describe('loadUiReviewHistory', () => {
  it('returns empty array for empty storage', () => {
    const adapter = makeAdapter()
    expect(loadUiReviewHistory(adapter)).toEqual([])
  })

  it('returns saved sessions', () => {
    const adapter = makeAdapter()
    saveUiReviewHistory(makeSession('rev_001', 1000), adapter)
    saveUiReviewHistory(makeSession('rev_002', 2000), adapter)
    const loaded = loadUiReviewHistory(adapter)
    expect(loaded).toHaveLength(2)
  })

  it('returns sessions sorted by createdAt descending', () => {
    const adapter = makeAdapter()
    saveUiReviewHistory(makeSession('rev_old', 1000), adapter)
    saveUiReviewHistory(makeSession('rev_new', 5000), adapter)
    const loaded = loadUiReviewHistory(adapter)
    expect(loaded[0].id).toBe('rev_new')
  })
})
