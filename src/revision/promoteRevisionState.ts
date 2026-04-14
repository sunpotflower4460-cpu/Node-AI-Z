import { rebuildPlasticityState } from './plasticityState'
import { deriveChangeStatus, deriveEntryStatus, normalizeChangeStatus } from './promotionRules'
import type { ProposedChange, RevisionEntry, RevisionState } from './types'

const cloneChange = (change: Partial<ProposedChange> & Pick<ProposedChange, 'id' | 'kind' | 'key' | 'delta'>): ProposedChange => ({
  ...change,
  reason: change.reason ?? '',
  status: normalizeChangeStatus(change.status),
})

const cloneEntry = (entry: Partial<RevisionEntry> & Pick<RevisionEntry, 'id' | 'timestamp' | 'inputText' | 'rawReply' | 'adjustedReply' | 'note'>): RevisionEntry => ({
  ...entry,
  issueTags: [...(entry.issueTags ?? [])],
  proposedChanges: (entry.proposedChanges ?? []).map(cloneChange),
  status: normalizeChangeStatus(entry.status),
})

const normalizeState = (state: RevisionState): RevisionState => {
  const entries = state.memory.entries.map(cloneEntry)
  const kept = new Set(state.tuning.kept ?? [])
  const softened = new Set(state.tuning.softened ?? [])
  const reverted = new Set(state.tuning.reverted ?? [])

  entries.forEach((entry) => {
    entry.proposedChanges.forEach((change) => {
      if (change.status === 'reverted') {
        reverted.add(change.id)
      }
      if (change.status === 'provisional' || change.status === 'promoted') {
        kept.add(change.id)
      }
      if (change.status === 'ephemeral' && state.tuning.softened.has(change.id)) {
        softened.add(change.id)
      }
    })
  })

  return {
    ...state,
    memory: {
      ...state.memory,
      entries,
      promoted: [],
      ephemeral: [],
      maxEphemeralSize: state.memory.maxEphemeralSize || 50,
      lastCleanup: state.memory.lastCleanup || new Date().toISOString(),
    },
    tuning: {
      locked: new Set(state.tuning.locked ?? []),
      softened,
      reverted,
      kept,
    },
  }
}

export const promoteRevisionState = (state: RevisionState): RevisionState => {
  const normalized = normalizeState(state)
  const entries = normalized.memory.entries.map((entry) => {
    const proposedChanges = entry.proposedChanges.map((change) => ({
      ...change,
      status: deriveChangeStatus(change, normalized),
    }))

    return {
      ...entry,
      proposedChanges,
      status: deriveEntryStatus({ ...entry, proposedChanges }),
    }
  })

  const memory = {
    ...normalized.memory,
    entries,
    promoted: entries.filter((entry) => entry.status === 'promoted'),
    ephemeral: entries.filter((entry) => entry.status === 'ephemeral').slice(0, normalized.memory.maxEphemeralSize),
    lastCleanup: new Date().toISOString(),
  }

  const nextState = {
    ...normalized,
    memory,
  }

  return {
    ...nextState,
    plasticity: rebuildPlasticityState(nextState),
  }
}
