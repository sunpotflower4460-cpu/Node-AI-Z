import type { UserTuningAction, RevisionState } from './revisionTypes'
import { syncRevisionState } from './revisionLog'

const EPHEMERAL_INFLUENCE = 0.35
const PROVISIONAL_INFLUENCE = 0.6

/**
 * Apply user tuning actions to revision entries
 * This allows users to keep, soften, revert, or lock changes
 */

export const applyUserTuning = (
  state: RevisionState,
  entryId: string,
  changeId: string,
  action: UserTuningAction,
): RevisionState => {
  const nextState: RevisionState = {
    ...state,
    memory: {
      ...state.memory,
      entries: state.memory.entries.map((entry) => ({
        ...entry,
        issueTags: [...entry.issueTags],
        proposedChanges: entry.proposedChanges.map((change) => ({ ...change })),
      })),
    },
    tuning: {
      locked: new Set(state.tuning.locked),
      softened: new Set(state.tuning.softened),
      reverted: new Set(state.tuning.reverted),
      kept: new Set(state.tuning.kept),
    },
  }

  switch (action) {
    case 'keep':
      nextState.tuning.kept.add(changeId)
      nextState.tuning.softened.delete(changeId)
      nextState.tuning.reverted.delete(changeId)
      updateChangeStatus(nextState, entryId, changeId, 'provisional')
      break

    case 'soften':
      nextState.tuning.softened.add(changeId)
      nextState.tuning.kept.delete(changeId)
      nextState.tuning.reverted.delete(changeId)
      updateChangeStatus(nextState, entryId, changeId, 'ephemeral')
      break

    case 'revert':
      nextState.tuning.reverted.add(changeId)
      nextState.tuning.kept.delete(changeId)
      nextState.tuning.softened.delete(changeId)
      updateChangeStatus(nextState, entryId, changeId, 'reverted')
      break

    case 'lock':
      nextState.tuning.locked.add(changeId)
      updateChangeStatus(nextState, entryId, changeId, 'promoted')
      break
  }

  return syncRevisionState(nextState)
}

const updateChangeStatus = (
  state: RevisionState,
  entryId: string,
  changeId: string,
  status: 'ephemeral' | 'provisional' | 'promoted' | 'reverted',
) => {
  const entry = state.memory.entries.find((currentEntry) => currentEntry.id === entryId)
  if (!entry) return

  const change = entry.proposedChanges.find((currentChange) => currentChange.id === changeId)
  if (change) {
    change.status = status
  }

  if (entry.proposedChanges.every((currentChange) => currentChange.status === 'reverted')) {
    entry.status = 'reverted'
  } else if (entry.proposedChanges.some((currentChange) => currentChange.status === 'promoted')) {
    entry.status = 'promoted'
  } else if (entry.proposedChanges.some((currentChange) => currentChange.status === 'provisional')) {
    entry.status = 'provisional'
  } else {
    entry.status = 'ephemeral'
  }
}

/**
 * Get effective delta for a change considering user tuning
 */
export const getEffectiveDelta = (
  changeId: string,
  originalDelta: number,
  tuning: RevisionState['tuning'],
): number => {
  if (tuning.reverted.has(changeId)) {
    return 0
  }
  if (tuning.locked.has(changeId)) {
    return originalDelta
  }
  if (tuning.softened.has(changeId)) {
    return originalDelta * EPHEMERAL_INFLUENCE
  }
  if (tuning.kept.has(changeId)) {
    return originalDelta * PROVISIONAL_INFLUENCE
  }
  return originalDelta * EPHEMERAL_INFLUENCE
}
