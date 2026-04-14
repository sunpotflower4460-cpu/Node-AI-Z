import { describe, expect, it } from 'vitest'
import { createDefaultRevisionState } from '../defaultRevisionState'
import { rebuildPlasticityState } from '../plasticityState'
import type { ProposedChange, RevisionEntry, RevisionState } from '../types'

const makeEntry = (id: string, change: ProposedChange): RevisionEntry => ({
  id,
  timestamp: `2026-04-14T14:5${id.slice(-1)}:00.000Z`,
  inputText: id,
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

describe('rebuildPlasticityState', () => {
  it('applies promoted changes more strongly than provisional changes', () => {
    const provisionalState = makeState([
      makeEntry('entry_1', {
        id: 'change_1',
        kind: 'tone_bias',
        key: 'certainty',
        delta: -0.04,
        reason: 'provisional',
        status: 'provisional',
      }),
    ])
    const promotedState = makeState([
      makeEntry('entry_1', {
        id: 'change_1',
        kind: 'tone_bias',
        key: 'certainty',
        delta: -0.04,
        reason: 'promoted',
        status: 'promoted',
      }),
    ])

    const provisionalPlasticity = rebuildPlasticityState(provisionalState)
    const promotedPlasticity = rebuildPlasticityState(promotedState)

    expect(Math.abs(promotedPlasticity.toneBiases.certainty)).toBeGreaterThan(Math.abs(provisionalPlasticity.toneBiases.certainty))
  })

  it('does not apply reverted changes', () => {
    const state = makeState([
      makeEntry('entry_1', {
        id: 'change_1',
        kind: 'tone_bias',
        key: 'certainty',
        delta: -0.04,
        reason: 'reverted',
        status: 'reverted',
      }),
    ])

    const plasticity = rebuildPlasticityState(state)
    expect(plasticity.toneBiases.certainty ?? 0).toBe(0)
  })

  it('writes node, relation, and home trigger changes into the correct maps', () => {
    const state = makeState([
      makeEntry('entry_3', {
        id: 'change_3',
        kind: 'home_trigger',
        key: 'fragility',
        delta: 0.04,
        reason: 'home',
        status: 'promoted',
      }),
      makeEntry('entry_2', {
        id: 'change_2',
        kind: 'relation_weight',
        key: 'fatigue->routine',
        delta: 0.03,
        reason: 'relation',
        status: 'promoted',
      }),
      makeEntry('entry_1', {
        id: 'change_1',
        kind: 'node_weight',
        key: 'fatigue',
        delta: 0.02,
        reason: 'node',
        status: 'promoted',
      }),
    ])

    const plasticity = rebuildPlasticityState(state)

    expect(plasticity.nodeBoosts.fatigue).toBeGreaterThan(0)
    expect(plasticity.relationBoosts['fatigue->routine']).toBeGreaterThan(0)
    expect(plasticity.homeTriggerBoosts.fragility).toBeGreaterThan(0)
  })
})
