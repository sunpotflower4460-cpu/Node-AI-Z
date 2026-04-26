import type { SignalConsolidationState } from './signalConsolidationTypes'

/**
 * Create initial consolidation state for Signal Mode.
 */
export function createConsolidationState(): SignalConsolidationState {
  return {
    lastConsolidatedAt: Date.now(),
    consolidationCount: 0,
    recentReplayAssemblyIds: [],
    strengthenedAssemblyIds: [],
    weakenedBridgeIds: [],
    prunedLinkCount: 0,
    notes: [],
  }
}
