import { rebuildPlasticityState } from './plasticityState'
import { deriveChangeStatus } from './promotionRules'
import type { ChangeStatus, RevisionEntry, RevisionState } from './types'

const deriveEntryStatusFromChanges = (changes: RevisionEntry['proposedChanges']): ChangeStatus => {
  if (changes.length === 0) return 'ephemeral'
  if (changes.every((c) => c.status === 'reverted')) return 'reverted'
  if (changes.some((c) => c.status === 'promoted')) return 'promoted'
  if (changes.some((c) => c.status === 'provisional')) return 'provisional'
  return 'ephemeral'
}

/**
 * Walk all entries and proposed changes, re-derive status from promotion rules,
 * then rebuild entry.status and plasticity.
 * Returns a new immutable RevisionState.
 */
export const promoteRevisionState = (state: RevisionState): RevisionState => {
  const updatedEntries = state.memory.entries.map((entry) => {
    const updatedChanges = entry.proposedChanges.map((change) => ({
      ...change,
      status: deriveChangeStatus(change, state),
    }))
    return {
      ...entry,
      proposedChanges: updatedChanges,
      issueTags: [...entry.issueTags],
      status: deriveEntryStatusFromChanges(updatedChanges),
    }
  })

  const updatedState: RevisionState = {
    ...state,
    memory: {
      ...state.memory,
      entries: updatedEntries,
      promoted: updatedEntries.filter((e) => e.status === 'promoted'),
      ephemeral: updatedEntries
        .filter((e) => e.status === 'ephemeral')
        .slice(0, state.memory.maxEphemeralSize || 50),
      lastCleanup: new Date().toISOString(),
    },
  }

  return {
    ...updatedState,
    plasticity: rebuildPlasticityState(updatedState),
  }
}
