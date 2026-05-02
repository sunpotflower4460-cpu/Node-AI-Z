import type { SignalModeSnapshot } from './signalPersistenceTypes'
import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from '../signalBackground/signalBackgroundTypes'

/**
 * Extends an existing Signal Mode snapshot with organism and background state.
 * Returns a new snapshot object (does not mutate the original).
 */
export function extendSignalSnapshotWithOrganism(
  snapshot: SignalModeSnapshot,
  organismState: PersistentOrganismState,
  backgroundLoopState: BackgroundLoopState,
): SignalModeSnapshot {
  return {
    ...snapshot,
    organismState,
    backgroundLoopState,
    updatedAt: Date.now(),
  }
}
