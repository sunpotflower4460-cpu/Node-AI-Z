import type { PersistentOrganismState, OrganismBackgroundSignal } from './signalOrganismTypes'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Updates the persistent organism state after a background tick.
 *
 * Background cycles keep the state alive and prevent complete reset
 * without requiring external input.
 */
export function updateOrganismStateFromBackground(
  state: PersistentOrganismState,
  signal: OrganismBackgroundSignal,
): PersistentOrganismState {
  const { cycleType, timestamp } = signal

  let regulation = { ...state.regulation }
  let continuity = { ...state.continuity }
  let lifecycle = { ...state.lifecycle }

  if (cycleType === 'micro_pulse') {
    // Micro pulse: very light update — keep alive, prevent decay to zero
    regulation = {
      ...regulation,
      energy: clamp(regulation.energy + 0.008),
      overload: clamp(regulation.overload - 0.005),
      replayPressure: clamp(regulation.replayPressure + 0.01),
    }
    continuity = {
      ...continuity,
      selfEcho: clamp(continuity.selfEcho - 0.005),
      internalRhythm: clamp(continuity.internalRhythm + 0.01 - 0.005 * Math.sin(timestamp / 5000)),
      baselineActivation: clamp(
        continuity.baselineActivation + (Math.random() * 0.01 - 0.005),
      ),
    }
  } else if (cycleType === 'weak_replay') {
    // Weak replay: slight consolidation pressure up, replay pressure down
    regulation = {
      ...regulation,
      replayPressure: clamp(regulation.replayPressure - 0.04),
      consolidationPressure: clamp(regulation.consolidationPressure + 0.03),
    }
    continuity = {
      ...continuity,
      replayTendency: clamp(continuity.replayTendency + 0.01),
    }
    lifecycle = {
      ...lifecycle,
      totalReplayCount: lifecycle.totalReplayCount + 1,
      backgroundTickCount: lifecycle.backgroundTickCount + 1,
    }
  } else if (cycleType === 'maintenance') {
    // Maintenance: light cleanup, overload down, energy mild recovery
    regulation = {
      ...regulation,
      energy: clamp(regulation.energy + 0.015),
      overload: clamp(regulation.overload - 0.015),
    }
    lifecycle = {
      ...lifecycle,
      backgroundTickCount: lifecycle.backgroundTickCount + 1,
    }
  }

  if (cycleType !== 'weak_replay' && cycleType !== 'maintenance') {
    lifecycle = {
      ...lifecycle,
      backgroundTickCount: lifecycle.backgroundTickCount + 1,
    }
  }

  return {
    ...state,
    lastActiveAt: timestamp,
    lastBackgroundTickAt: timestamp,
    lifecycle,
    regulation,
    continuity,
  }
}
