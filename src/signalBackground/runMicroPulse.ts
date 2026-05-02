import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from './signalBackgroundTypes'
import { updateOrganismStateFromBackground } from '../signalOrganism/updateOrganismStateFromBackground'

/**
 * Runs a micro pulse cycle.
 *
 * Very lightly stirs the internal state to prevent it from drifting to
 * a completely static baseline while no input arrives.
 */
export function runMicroPulse(
  organism: PersistentOrganismState,
  background: BackgroundLoopState,
  timestamp: number,
): { organism: PersistentOrganismState; background: BackgroundLoopState; notes: string[] } {
  const notes: string[] = []

  const updatedOrganism = updateOrganismStateFromBackground(organism, {
    cycleType: 'micro_pulse',
    timestamp,
  })

  notes.push('micro pulse: baseline activation nudged, self echo decayed slightly')

  const updatedBackground: BackgroundLoopState = {
    ...background,
    mode: 'idle',
    lastTickAt: timestamp,
    tickCount: background.tickCount + 1,
    lastCycleType: 'micro_pulse',
  }

  return { organism: updatedOrganism, background: updatedBackground, notes }
}
