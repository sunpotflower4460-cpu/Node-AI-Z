import { promoteRevisionState } from './promoteRevisionState'
import type { RevisionEntry, RevisionState } from './types'

export const syncRevisionState = (state: RevisionState): RevisionState => {
  return promoteRevisionState(state)
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
