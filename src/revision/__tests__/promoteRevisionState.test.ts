import { describe, it, expect } from 'vitest'
import { createDefaultRevisionState } from '../defaultRevisionState'
import { promoteRevisionState } from '../promoteRevisionState'
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

const stateWithEntries = (entries: RevisionEntry[], tuningOverrides: Partial<RevisionState['tuning']> = {}): RevisionState => ({
  ...createDefaultRevisionState(),
  memory: {
    ...createDefaultRevisionState().memory,
    entries,
  },
  tuning: {
    ...createDefaultRevisionState().tuning,
    ...tuningOverrides,
    locked: tuningOverrides.locked ?? new Set(),
    softened: tuningOverrides.softened ?? new Set(),
    reverted: tuningOverrides.reverted ?? new Set(),
    kept: tuningOverrides.kept ?? new Set(),
  },
})

describe('promoteRevisionState', () => {
  it('recalculates change status after state update', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state = stateWithEntries([e1, e2, e3], { kept: new Set(['c1', 'c2']) })

    const next = promoteRevisionState(state)
    const updatedChange = next.memory.entries
      .flatMap((e) => e.proposedChanges)
      .find((c) => c.id === 'c1')

    // keep 2 + occurrences 3 → promoted
    expect(updatedChange?.status).toBe('promoted')
  })

  it('updates entry.status based on its changes', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state = stateWithEntries([e1, e2, e3], { kept: new Set(['c1', 'c2']) })

    const next = promoteRevisionState(state)
    const entry = next.memory.entries.find((e) => e.id === 'e1')
    expect(entry?.status).toBe('promoted')
  })

  it('rebuilds plasticity after promotion', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const stateBeforePromotion = stateWithEntries([e1, e2, e3])
    const stateAfterPromotion = stateWithEntries([e1, e2, e3], { kept: new Set(['c1', 'c2']) })

    const before = promoteRevisionState(stateBeforePromotion)
    const after = promoteRevisionState(stateAfterPromotion)

    const beforeBias = before.plasticity.toneBiases['over_explaining'] ?? 0
    const afterBias = after.plasticity.toneBiases['over_explaining'] ?? 0
    // promoted weight (1.0) > ephemeral weight (0.35), so afterBias should be more negative (stronger)
    expect(afterBias).toBeLessThan(beforeBias)
  })

  it('promoted changes have stronger plasticity influence than provisional', () => {
    const cProv = makeChange({ id: 'cProv', status: 'ephemeral' })
    const cProm = makeChange({ id: 'cProm', status: 'ephemeral' })
    const eProv = makeEntry([cProv], 'eProv')
    const eProm1 = makeEntry([cProm], 'eProm1')
    const eProm2 = makeChange({ id: 'cProm2', kind: 'tone_bias', key: 'over_explaining', delta: -0.04, reason: 'test', status: 'ephemeral' })
    const eProm2Entry = makeEntry([eProm2], 'eProm2Entry')

    // provisional: 1 keep, 1 occurrence
    const provState = stateWithEntries([eProv], { kept: new Set(['cProv']) })
    // promoted: 2 keeps, 3 occurrences
    const promState = stateWithEntries([eProm1, eProm2Entry, makeEntry([makeChange({ id: 'cProm3' })], 'eProm3')], {
      kept: new Set(['cProm', 'cProm2']),
    })

    const provResult = promoteRevisionState(provState)
    const promResult = promoteRevisionState(promState)

    const provBias = Math.abs(provResult.plasticity.toneBiases['over_explaining'] ?? 0)
    const promBias = Math.abs(promResult.plasticity.toneBiases['over_explaining'] ?? 0)

    expect(promBias).toBeGreaterThan(provBias)
  })

  it('reverted changes do not get promoted', () => {
    const c1 = makeChange({ id: 'c1' })
    const c2 = makeChange({ id: 'c2' })
    const c3 = makeChange({ id: 'c3' })
    const e1 = makeEntry([c1], 'e1')
    const e2 = makeEntry([c2], 'e2')
    const e3 = makeEntry([c3], 'e3')
    const state = stateWithEntries([e1, e2, e3], {
      kept: new Set(['c1', 'c2']),
      reverted: new Set(['c1']),
    })

    const next = promoteRevisionState(state)
    const change = next.memory.entries.flatMap((e) => e.proposedChanges).find((c) => c.id === 'c1')
    expect(change?.status).toBe('reverted')
  })

  it('returns an immutable new state (does not mutate input)', () => {
    const c1 = makeChange({ id: 'c1' })
    const entry = makeEntry([c1])
    const state = stateWithEntries([entry])
    const originalStatus = c1.status

    promoteRevisionState(state)
    expect(c1.status).toBe(originalStatus)
  })
})
