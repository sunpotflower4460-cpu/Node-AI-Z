import { describe, expect, it } from 'vitest'
import { createDefaultRevisionState } from '../defaultRevisionState'
import { deriveChangeStatus, getChangePromotionStats } from '../promotionRules'
import type { ProposedChange, RevisionEntry, RevisionState } from '../types'

const makeChange = (id: string, status: ProposedChange['status'] = 'ephemeral'): ProposedChange => ({
  id,
  kind: 'tone_bias',
  key: 'over_explaining',
  delta: -0.04,
  reason: 'test reason',
  status,
})

const makeEntry = (id: string, change: ProposedChange): RevisionEntry => ({
  id,
  timestamp: `2026-04-14T14:3${id.slice(-1)}:00.000Z`,
  inputText: `input ${id}`,
  rawReply: '',
  adjustedReply: '',
  issueTags: [],
  note: '',
  proposedChanges: [change],
  status: change.status,
})

const makeState = (entries: RevisionEntry[]): RevisionState => ({
  ...createDefaultRevisionState(),
  memory: {
    ...createDefaultRevisionState().memory,
    entries,
  },
})

describe('promotionRules', () => {
  it('raises a change to provisional after two keeps', () => {
    const first = makeChange('change_1')
    const second = makeChange('change_2')
    const state = makeState([makeEntry('entry_2', second), makeEntry('entry_1', first)])
    state.tuning.kept.add(first.id)
    state.tuning.kept.add(second.id)

    expect(getChangePromotionStats(state, first)).toMatchObject({
      sameKeyOccurrences: 2,
      keepCount: 2,
    })
    expect(deriveChangeStatus(first, state)).toBe('provisional')
  })

  it('raises a change to promoted after two keeps and three occurrences', () => {
    const first = makeChange('change_1')
    const second = makeChange('change_2')
    const third = makeChange('change_3')
    const state = makeState([makeEntry('entry_3', third), makeEntry('entry_2', second), makeEntry('entry_1', first)])
    state.tuning.kept.add(first.id)
    state.tuning.kept.add(second.id)

    expect(deriveChangeStatus(third, state)).toBe('promoted')
  })

  it('keeps reverted changes out of promotion', () => {
    const first = makeChange('change_1')
    const second = makeChange('change_2')
    const reverted = makeChange('change_3')
    const state = makeState([makeEntry('entry_3', reverted), makeEntry('entry_2', second), makeEntry('entry_1', first)])
    state.tuning.kept.add(first.id)
    state.tuning.kept.add(second.id)
    state.tuning.reverted.add(reverted.id)

    expect(deriveChangeStatus(reverted, state)).toBe('reverted')
  })

  it('keeps locked changes at their current status', () => {
    const first = makeChange('change_1')
    const second = makeChange('change_2')
    const locked = makeChange('change_3')
    const state = makeState([makeEntry('entry_3', locked), makeEntry('entry_2', second), makeEntry('entry_1', first)])
    state.tuning.kept.add(first.id)
    state.tuning.kept.add(second.id)
    state.tuning.locked.add(locked.id)

    expect(deriveChangeStatus(locked, state)).toBe('ephemeral')
  })

  it('requires one extra keep after soften', () => {
    const first = makeChange('change_1')
    const second = makeChange('change_2')
    const softened = makeChange('change_3')
    const state = makeState([makeEntry('entry_3', softened), makeEntry('entry_2', second), makeEntry('entry_1', first)])
    state.tuning.kept.add(first.id)
    state.tuning.kept.add(second.id)
    state.tuning.softened.add(softened.id)

    expect(deriveChangeStatus(softened, state)).toBe('provisional')

    state.tuning.kept.add(softened.id)
    expect(deriveChangeStatus(softened, state)).toBe('promoted')
  })
})
