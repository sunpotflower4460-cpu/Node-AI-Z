import type { SignalReconsolidationState } from './signalReconsolidationTypes'

export type ReconsolidationSummary = {
  openCount: number
  revisedCount: number
  restabilizedCount: number
  recentTargets: string[]
  notes: string[]
}

export function buildReconsolidationSummary(
  state: SignalReconsolidationState,
): ReconsolidationSummary {
  return {
    openCount: state.openMemories.length,
    revisedCount: state.recentlyRevisedTargetIds.length,
    restabilizedCount: state.recentlyRestabilizedTargetIds.length,
    recentTargets: state.recentlyRestabilizedTargetIds.slice(-5),
    notes: state.notes,
  }
}
