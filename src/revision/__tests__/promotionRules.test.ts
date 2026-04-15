import { describe, it, expect } from 'vitest'
import { createDefaultRevisionState } from '../defaultRevisionState'
import { deriveChangeStatus, getChangePromotionStats } from '../promotionRules'
import type { ProposedChange, RevisionEntry, RevisionState } from '../types'

const makeChange = (overrides: Partial<ProposedChange> = {}): ProposedChange => ({
  id: `change_${Math.random().toString(36).slice(2)}`,
  kind: 'tone_bias',
  key: 'over_explaining',
  delta: -0.04,
  reason: 'test',
  status: 'ephemeral',
  ...overrides,
})

const makeEntry = (changes: ProposedChange[], id = `entry_${Math.random().toString(36).slice(2)}`): RevisionEntry => ({
  id,
  timestamp: new Date().toISOString(),
  inputText: 'test input',
  rawReply: '',
  adjustedReply: '',
  issueTags: [],
  note: '',
  proposedChanges: changes,
  status: 'ephemeral',
})

const makeStateWithEntries = (entries: RevisionEntry[]): RevisionState => ({
  ...createDefaultRevisionState(),
  memory: {
    ...createDefaultRevisionState().memory,
    entries,
  },
})

describe('getChangePromotionStats', () => {
  it('returns 0 keepCount and 1 occurrence for a fresh ephemeral change', () => {
    const change = makeChange()
    const entry = makeEntry([change])
    const state = makeStateWithEntries([entry])
    const stats = getChangePromotionStats(change, state)
    expect(stats.keepCount).toBe(0)
    expect(stats.sameKeyOccurrences).toBe(1)
    expect(stats.isLocked).toBe(false)
    expect(stats.revertedCount).toBe(0)
    expect(stats.softenCount).toBe(0)
  })

  it('counts kept changes correctly across multiple entries', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2]),
      tuning: {
        ...createDefaultRevisionState().tuning,
        kept: new Set(['c1']),
      },
    }
    const stats = getChangePromotionStats(c1, state)
    expect(stats.keepCount).toBe(1)
    expect(stats.sameKeyOccurrences).toBe(2)
  })

  it('detects locked change', () => {
    const change = makeChange({ id: 'c_locked' })
    const entry = makeEntry([change])
    const state: RevisionState = {
      ...makeStateWithEntries([entry]),
      tuning: { ...createDefaultRevisionState().tuning, locked: new Set(['c_locked']) },
    }
    const stats = getChangePromotionStats(change, state)
    expect(stats.isLocked).toBe(true)
  })
})

describe('deriveChangeStatus', () => {
  it('returns ephemeral for a fresh change with no keeps', () => {
    const change = makeChange()
    const entry = makeEntry([change])
    const state = makeStateWithEntries([entry])
    expect(deriveChangeStatus(change, state)).toBe('ephemeral')
  })

  it('returns provisional when keep count reaches 2', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2]),
      tuning: { ...createDefaultRevisionState().tuning, kept: new Set(['c1', 'c2']) },
    }
    // c1 has keepCount=2, occurrences=2 → provisional (not yet promoted: need occ>=3)
    expect(deriveChangeStatus(c1, state)).toBe('provisional')
  })

  it('returns promoted when keep >= 2 AND occurrences >= 3', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2, e3]),
      tuning: { ...createDefaultRevisionState().tuning, kept: new Set(['c1', 'c2']) },
    }
    expect(deriveChangeStatus(c1, state)).toBe('promoted')
  })

  it('returns reverted for a reverted change regardless of keeps', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2, e3]),
      tuning: {
        ...createDefaultRevisionState().tuning,
        kept: new Set(['c1', 'c2']),
        reverted: new Set(['c1']),
      },
    }
    expect(deriveChangeStatus(c1, state)).toBe('reverted')
  })

  it('raises threshold for softened change — provisional requires keep >= 3 instead of 2', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2]),
      tuning: {
        ...createDefaultRevisionState().tuning,
        kept: new Set(['c1', 'c2']),
        softened: new Set(['c1']),
      },
    }
    // 2 keeps but c1 is softened, threshold becomes 3 → still ephemeral
    expect(deriveChangeStatus(c1, state)).toBe('ephemeral')
  })

  it('softened change can reach provisional with 3 keeps', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state: RevisionState = {
      ...makeStateWithEntries([e1, e2, e3]),
      tuning: {
        ...createDefaultRevisionState().tuning,
        kept: new Set(['c1', 'c2', 'c3']),
        softened: new Set(['c1']),
      },
    }
    // 3 keeps + 3 occurrences + c1 softened → threshold 3 met → promoted
    expect(deriveChangeStatus(c1, state)).toBe('promoted')
  })

  it('locked change is not auto-changed', () => {
    const c1 = makeChange({ id: 'c1', status: 'promoted' })
    const entry = makeEntry([c1])
    const state: RevisionState = {
      ...makeStateWithEntries([entry]),
      tuning: { ...createDefaultRevisionState().tuning, locked: new Set(['c1']) },
    }
    expect(deriveChangeStatus(c1, state)).toBe('promoted')
  })

  it('locked ephemeral change stays ephemeral (no auto-promotion)', () => {
    const c1 = makeChange({ id: 'c1', status: 'ephemeral' })
    const entry = makeEntry([c1])
    const state: RevisionState = {
      ...makeStateWithEntries([entry]),
      tuning: { ...createDefaultRevisionState().tuning, locked: new Set(['c1']) },
    }
    // locked → no auto change
    expect(deriveChangeStatus(c1, state)).toBe('ephemeral')
  })

  it('provisional when occurrence >= 3 even without keeps', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state = makeStateWithEntries([e1, e2, e3])
    // 0 keeps, 3 occurrences → provisional (Rule 2)
    expect(deriveChangeStatus(c1, state)).toBe('provisional')
  })
})
