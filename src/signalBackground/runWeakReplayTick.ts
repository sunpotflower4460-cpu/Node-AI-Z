import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from './signalBackgroundTypes'
import { updateOrganismStateFromBackground } from '../signalOrganism/updateOrganismStateFromBackground'

const MAX_REPLAY_PER_TICK = 3

/**
 * Runs a weak replay tick.
 *
 * Selects a few recent assembly IDs from the replay queue and
 * weakly re-activates them in the organism's continuity state.
 * Does NOT strongly modify the particle field in Phase 1.
 */
export function runWeakReplayTick(
  organism: PersistentOrganismState,
  background: BackgroundLoopState,
  timestamp: number,
): { organism: PersistentOrganismState; background: BackgroundLoopState; notes: string[] } {
  const notes: string[] = []

  const replayIds = organism.recent.replayQueueIds.slice(0, MAX_REPLAY_PER_TICK)
  notes.push(`weak replay: selected ${replayIds.length} items from replay queue`)

  // Update internal replay ratio in source balance
  const prevTotal = organism.lifecycle.totalInputCount + organism.lifecycle.totalReplayCount
  const newInternalRatio =
    prevTotal > 0
      ? (organism.sourceBalance.internalReplayRatio * prevTotal + replayIds.length) /
        (prevTotal + replayIds.length)
      : 0

  const updatedRecent = {
    ...organism.recent,
    // Move replayed items to end of recent list (weak re-activation)
    recentAssemblyIds: [
      ...organism.recent.recentAssemblyIds.filter(id => !replayIds.includes(id)),
      ...replayIds,
    ].slice(-20),
    // Remove replayed items from queue
    replayQueueIds: organism.recent.replayQueueIds.slice(MAX_REPLAY_PER_TICK),
  }

  let updatedOrganism = updateOrganismStateFromBackground(organism, {
    cycleType: 'weak_replay',
    timestamp,
  })

  updatedOrganism = {
    ...updatedOrganism,
    recent: updatedRecent,
    sourceBalance: {
      ...updatedOrganism.sourceBalance,
      internalReplayRatio: Math.min(1, newInternalRatio),
    },
  }

  const updatedBackground: BackgroundLoopState = {
    ...background,
    mode: 'replay',
    lastTickAt: timestamp,
    tickCount: background.tickCount + 1,
    lastCycleType: 'weak_replay',
    pendingReplayIds: updatedOrganism.recent.replayQueueIds,
  }

  return { organism: updatedOrganism, background: updatedBackground, notes }
}
