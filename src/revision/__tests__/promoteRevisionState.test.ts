import { describe, expect, it } from 'vitest'
import { applyUserTuning } from '../applyUserTuning'
import { createDefaultRevisionState } from '../defaultRevisionState'
import { promoteRevisionState } from '../promoteRevisionState'
import { addRevisionEntry } from '../revisionLog'
import type { ProposedChange, RevisionEntry, RevisionState } from '../types'

const makeChange = (id: string, kind: ProposedChange['kind'] = 'tone_bias', key = 'over_explaining', delta = -0.04): ProposedChange => ({
  id,
  kind,
  key,
  delta,
  reason: `reason ${id}`,
  status: 'ephemeral',
})

const makeEntry = (id: string, change: ProposedChange): RevisionEntry => ({
  id,
  timestamp: `2026-04-14T14:4${id.slice(-1)}:00.000Z`,
  inputText: id,
  rawReply: '',
  adjustedReply: '',
  issueTags: [],
  note: '',
  proposedChanges: [change],
  status: 'ephemeral',
})

const getChange = (state: RevisionState, changeId: string) => {
  return state.memory.entries.flatMap((entry) => entry.proposedChanges).find((change) => change.id === changeId)
}

describe('promoteRevisionState', () => {
  it('promotes repeated kept changes after addRevisionEntry sync', () => {
    const firstEntry = makeEntry('entry_1', makeChange('change_1'))
    const secondEntry = makeEntry('entry_2', makeChange('change_2'))
    const thirdEntry = makeEntry('entry_3', makeChange('change_3'))

    let state = createDefaultRevisionState()
    state = addRevisionEntry(state, firstEntry)
    state = addRevisionEntry(state, secondEntry)
    state = applyUserTuning(state, firstEntry.id, firstEntry.proposedChanges[0].id, 'keep')
    state = applyUserTuning(state, secondEntry.id, secondEntry.proposedChanges[0].id, 'keep')
    state = addRevisionEntry(state, thirdEntry)

    expect(state.memory.entries.every((entry) => entry.proposedChanges[0]?.status === 'promoted')).toBe(true)
    expect(state.memory.promoted).toHaveLength(3)
  })

  it('recomputes promotion after tuning actions', () => {
    const firstEntry = makeEntry('entry_1', makeChange('change_1'))
    const secondEntry = makeEntry('entry_2', makeChange('change_2'))

    let state = createDefaultRevisionState()
    state = addRevisionEntry(state, firstEntry)
    state = addRevisionEntry(state, secondEntry)

    expect(getChange(state, 'change_1')?.status).toBe('ephemeral')

    state = applyUserTuning(state, firstEntry.id, 'change_1', 'keep')
    expect(getChange(state, 'change_1')?.status).toBe('ephemeral')

    state = applyUserTuning(state, secondEntry.id, 'change_2', 'keep')
    expect(getChange(state, 'change_1')?.status).toBe('provisional')
    expect(getChange(state, 'change_2')?.status).toBe('provisional')
  })

  it('normalizes legacy entries and rebuilds memory buckets immutably', () => {
    const legacyState = {
      ...createDefaultRevisionState(),
      memory: {
        ...createDefaultRevisionState().memory,
        entries: [
          {
            id: 'entry_legacy',
            timestamp: '2026-04-14T14:40:00.000Z',
            inputText: 'legacy',
            rawReply: '',
            adjustedReply: '',
            issueTags: undefined,
            note: '',
            proposedChanges: [
              {
                id: 'change_legacy',
                kind: 'tone_bias',
                key: 'certainty',
                delta: -0.02,
                reason: 'legacy',
              },
            ],
          },
        ],
      },
    } as unknown as RevisionState

    const next = promoteRevisionState(legacyState)

    expect(next).not.toBe(legacyState)
    expect(next.memory.entries[0]?.proposedChanges[0]?.status).toBe('ephemeral')
    expect(next.plasticity.lastUpdated).toBeTruthy()
  })
})
