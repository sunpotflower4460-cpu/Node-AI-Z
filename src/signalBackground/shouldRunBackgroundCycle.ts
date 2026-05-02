import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from './signalBackgroundTypes'

/** Minimum ms between micro_pulse ticks (5 seconds) */
const MICRO_PULSE_MIN_INTERVAL = 5_000
/** Maximum ms between micro_pulse ticks (15 seconds) */
const MICRO_PULSE_MAX_INTERVAL = 15_000
/** Minimum ms between maintenance ticks (1 minute) */
const MAINTENANCE_MIN_INTERVAL = 60_000
/** Minimum replayPressure to trigger a weak_replay */
const REPLAY_PRESSURE_THRESHOLD = 0.3
/** Minimum ms since last input before weak_replay is allowed */
const REPLAY_QUIET_PERIOD = 8_000

export type ShouldRunResult = {
  should: boolean
  cycleType?: 'micro_pulse' | 'weak_replay' | 'maintenance'
  reason: string
}

/**
 * Decides whether a background cycle should run, and which type.
 *
 * In browser/mobile environments, we cannot rely on precise intervals.
 * This function is called at each runtime invocation and uses elapsed time
 * to determine whether a cycle is due.
 */
export function shouldRunBackgroundCycle(
  now: number,
  organism: PersistentOrganismState,
  background: BackgroundLoopState,
  lastInputAt?: number,
): ShouldRunResult {
  const lastTick = background.lastTickAt ?? 0
  const elapsed = now - lastTick

  // --- maintenance: lowest priority, longest interval ---
  const lastMaintenance =
    background.lastCycleType === 'maintenance' ? lastTick : background.lastTickAt ?? 0
  const sinceLastMaintenance = now - lastMaintenance
  if (sinceLastMaintenance >= MAINTENANCE_MIN_INTERVAL) {
    return { should: true, cycleType: 'maintenance', reason: 'maintenance interval reached' }
  }

  // --- weak_replay: medium priority ---
  const timeSinceInput = lastInputAt !== undefined ? now - lastInputAt : Infinity
  if (
    organism.regulation.replayPressure >= REPLAY_PRESSURE_THRESHOLD &&
    timeSinceInput >= REPLAY_QUIET_PERIOD &&
    organism.recent.replayQueueIds.length > 0
  ) {
    return { should: true, cycleType: 'weak_replay', reason: 'replay pressure threshold reached' }
  }

  // --- micro_pulse: highest frequency ---
  const microPulseInterval =
    MICRO_PULSE_MIN_INTERVAL +
    Math.random() * (MICRO_PULSE_MAX_INTERVAL - MICRO_PULSE_MIN_INTERVAL)
  if (elapsed >= microPulseInterval) {
    return { should: true, cycleType: 'micro_pulse', reason: 'micro pulse interval reached' }
  }

  return { should: false, reason: 'no cycle due yet' }
}
