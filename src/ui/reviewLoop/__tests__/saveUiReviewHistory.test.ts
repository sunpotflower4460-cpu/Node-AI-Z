import { describe, expect, it } from 'vitest'
import { saveUiReviewHistory } from '../saveUiReviewHistory'
import { loadUiReviewHistory } from '../loadUiReviewHistory'
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

describe('saveUiReviewHistory', () => {
  it('saves a new session', () => {
    const adapter = makeAdapter()
    const session = makeSession('rev_001')
    saveUiReviewHistory(session, adapter)
    const loaded = adapter.load()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('rev_001')
  })

  it('updates existing session by id', () => {
    const adapter = makeAdapter()
    const session = makeSession('rev_001')
    saveUiReviewHistory(session, adapter)
    const updated = { ...session, initialAuditScore: 84 }
    saveUiReviewHistory(updated, adapter)
    const loaded = adapter.load()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].initialAuditScore).toBe(84)
  })

  it('appends multiple different sessions', () => {
    const adapter = makeAdapter()
    saveUiReviewHistory(makeSession('rev_001'), adapter)
    saveUiReviewHistory(makeSession('rev_002'), adapter)
    expect(adapter.load()).toHaveLength(2)
  })
})

describe('loadUiReviewHistory', () => {
  it('returns empty array when no history', () => {
    const adapter = makeAdapter()
    expect(loadUiReviewHistory(adapter)).toHaveLength(0)
  })

  it('returns sessions sorted by createdAt descending', () => {
    const adapter = makeAdapter()
    saveUiReviewHistory(makeSession('rev_001', 1000), adapter)
    saveUiReviewHistory(makeSession('rev_002', 3000), adapter)
    saveUiReviewHistory(makeSession('rev_003', 2000), adapter)
    const loaded = loadUiReviewHistory(adapter)
    expect(loaded[0].id).toBe('rev_002')
    expect(loaded[1].id).toBe('rev_003')
    expect(loaded[2].id).toBe('rev_001')
  })
})
