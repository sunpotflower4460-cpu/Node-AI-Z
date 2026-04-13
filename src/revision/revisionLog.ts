import { rebuildPlasticityState } from './plasticityState'
import type { ChangeStatus, RevisionEntry, RevisionState } from './types'

const deriveEntryStatus = (entry: RevisionEntry): ChangeStatus => {
  if (entry.proposedChanges.length === 0) {
    return entry.status
  }
  if (entry.proposedChanges.every((change) => change.status === 'reverted')) {
    return 'reverted'
  }
  if (entry.proposedChanges.some((change) => change.status === 'promoted')) {
    return 'promoted'
  }
  if (entry.proposedChanges.some((change) => change.status === 'provisional')) {
    return 'provisional'
  }
  return 'ephemeral'
}

export const syncRevisionState = (state: RevisionState): RevisionState => {
  const entries = state.memory.entries.map((entry) => ({
    ...entry,
    proposedChanges: entry.proposedChanges.map((change) => ({ ...change })),
    issueTags: [...entry.issueTags],
    status: deriveEntryStatus(entry),
  }))
  const maxEphemeralSize = state.memory.maxEphemeralSize || 50
  const memory = {
    ...state.memory,
    entries,
    promoted: entries.filter((entry) => entry.status === 'promoted'),
    ephemeral: entries.filter((entry) => entry.status === 'ephemeral').slice(0, maxEphemeralSize),
    maxEphemeralSize,
    lastCleanup: new Date().toISOString(),
  }
  const nextState = {
    ...state,
    memory,
  }

  return {
    ...nextState,
    plasticity: rebuildPlasticityState(nextState),
  }
}

export const addRevisionEntry = (state: RevisionState, entry: RevisionEntry): RevisionState => {
  if (state.memory.entries.some((existingEntry) => existingEntry.id === entry.id)) {
    return syncRevisionState(state)
  }

  return syncRevisionState({
    ...state,
    memory: {
      ...state.memory,
      entries: [entry, ...state.memory.entries],
    },
  })
}
