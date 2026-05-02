import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from './signalBackgroundTypes'
import { updateOrganismStateFromBackground } from '../signalOrganism/updateOrganismStateFromBackground'

const MAX_RECENT_ASSEMBLY_IDS = 20
const MAX_REPLAY_QUEUE_IDS = 30

/**
 * Runs a maintenance tick.
 *
 * Performs lightweight housekeeping:
 * - Trims oversized queues
 * - Lightly reduces overload
 * - Updates background health
 */
export function runMaintenanceTick(
  organism: PersistentOrganismState,
  background: BackgroundLoopState,
  timestamp: number,
): { organism: PersistentOrganismState; background: BackgroundLoopState; notes: string[] } {
  const notes: string[] = []

  let updatedOrganism = updateOrganismStateFromBackground(organism, {
    cycleType: 'maintenance',
    timestamp,
  })

  // Trim recent assembly IDs
  const trimmedAssemblyIds = updatedOrganism.recent.recentAssemblyIds.slice(
    -MAX_RECENT_ASSEMBLY_IDS,
  )
  const trimmedReplayQueue = updatedOrganism.recent.replayQueueIds.slice(-MAX_REPLAY_QUEUE_IDS)

  if (trimmedAssemblyIds.length < updatedOrganism.recent.recentAssemblyIds.length) {
    notes.push(
      `maintenance: trimmed recentAssemblyIds to ${trimmedAssemblyIds.length}`,
    )
  }
  if (trimmedReplayQueue.length < updatedOrganism.recent.replayQueueIds.length) {
    notes.push(`maintenance: trimmed replayQueueIds to ${trimmedReplayQueue.length}`)
  }

  updatedOrganism = {
    ...updatedOrganism,
    recent: {
      ...updatedOrganism.recent,
      recentAssemblyIds: trimmedAssemblyIds,
      replayQueueIds: trimmedReplayQueue,
    },
  }

  notes.push('maintenance: health updated')

  const updatedBackground: BackgroundLoopState = {
    ...background,
    mode: 'maintenance',
    lastTickAt: timestamp,
    tickCount: background.tickCount + 1,
    lastCycleType: 'maintenance',
    pendingMaintenanceTasks: [],
    health: {
      ...background.health,
      loopLoad: Math.max(0, background.health.loopLoad - 0.1),
      lastError: undefined,
    },
  }

  return { organism: updatedOrganism, background: updatedBackground, notes }
}
