/**
 * Signal Consolidation Types
 *
 * Handles resting-state replay and consolidation of Signal Mode patterns.
 * This allows the system to strengthen patterns during idle periods.
 */

export type SignalConsolidationState = {
  lastConsolidatedAt: number
  consolidationCount: number
  recentReplayAssemblyIds: string[]
  strengthenedAssemblyIds: string[]
  weakenedBridgeIds: string[]
  prunedLinkCount: number
  notes: string[]
}

export type RestingReplayResult = {
  replayedAssemblyIds: string[]
  strengthenedAssemblyIds: string[]
  weakenedAssemblyIds: string[]
  replaySuccessRate: number
  notes: string[]
}

export type SignalConsolidationInput = {
  now: number
  isUserActive: boolean
  recentActivityLevel: number
}
