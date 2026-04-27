import type { SignalReconsolidationState } from './signalReconsolidationTypes'

export function restabilizeSignalMemory(
  state: SignalReconsolidationState,
  timestamp: number,
): SignalReconsolidationState {
  return {
    openMemories: [],
    recentlyRevisedTargetIds: state.recentlyRevisedTargetIds,
    recentlyRestabilizedTargetIds: state.recentlyRevisedTargetIds.slice(-10),
    lastUpdatedAt: timestamp,
    notes:
      state.recentlyRevisedTargetIds.length > 0
        ? ['Revised memories were restabilized for future turns']
        : state.notes,
  }
}
