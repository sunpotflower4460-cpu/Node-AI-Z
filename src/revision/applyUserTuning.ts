import type { UserTuningAction, RevisionState } from './revisionTypes'
import { syncRevisionState } from './revisionLog'
import { getTuningWeight } from './plasticityState'

const cloneState = (state: RevisionState): RevisionState => ({
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
})

export const applyUserTuning = (
  state: RevisionState,
  entryId: string,
  changeId: string,
  action: UserTuningAction,
): RevisionState => {
  const nextState = cloneState(state)
  const entry = nextState.memory.entries.find((currentEntry) => currentEntry.id === entryId)
  const change = entry?.proposedChanges.find((currentChange) => currentChange.id === changeId)

  if (!entry || !change) {
    return syncRevisionState(nextState)
  }

  switch (action) {
    case 'keep':
      nextState.tuning.kept.add(changeId)
      nextState.tuning.softened.delete(changeId)
      nextState.tuning.reverted.delete(changeId)
      break
    case 'soften':
      nextState.tuning.softened.add(changeId)
      nextState.tuning.kept.delete(changeId)
      nextState.tuning.reverted.delete(changeId)
      break
    case 'revert':
      if (nextState.tuning.reverted.has(changeId)) {
        nextState.tuning.reverted.delete(changeId)
      } else {
        nextState.tuning.reverted.add(changeId)
        nextState.tuning.kept.delete(changeId)
        nextState.tuning.softened.delete(changeId)
      }
      break
    case 'lock':
      nextState.tuning.locked.add(changeId)
      break
  }

  return syncRevisionState(nextState)
}

export const getEffectiveDelta = (
  changeId: string,
  originalDelta: number,
  tuning: RevisionState['tuning'],
): number => {
  return originalDelta * getTuningWeight(changeId, tuning)
}
