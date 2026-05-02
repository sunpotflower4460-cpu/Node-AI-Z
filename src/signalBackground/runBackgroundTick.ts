import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState, BackgroundTickResult } from './signalBackgroundTypes'
import { shouldRunBackgroundCycle } from './shouldRunBackgroundCycle'
import { runMicroPulse } from './runMicroPulse'
import { runWeakReplayTick } from './runWeakReplayTick'
import { runMaintenanceTick } from './runMaintenanceTick'

export type RunBackgroundTickInput = {
  organism: PersistentOrganismState
  background: BackgroundLoopState
  now?: number
  lastInputAt?: number
}

/**
 * Runs one background tick for New Signal Mode.
 *
 * Processing order:
 * 1. shouldRunBackgroundCycle — decide if and what to run
 * 2. choose cycle type
 * 3. execute the cycle (micro_pulse / weak_replay / maintenance)
 * 4. update organism and background state
 * 5. return result with notes
 */
export function runBackgroundTick(input: RunBackgroundTickInput): BackgroundTickResult {
  const { organism, background, lastInputAt } = input
  const now = input.now ?? Date.now()

  const decision = shouldRunBackgroundCycle(now, organism, background, lastInputAt)

  if (!decision.should || !decision.cycleType) {
    return {
      ran: false,
      updatedOrganismState: organism,
      updatedBackgroundState: background,
      notes: [decision.reason],
    }
  }

  try {
    let result: { organism: PersistentOrganismState; background: BackgroundLoopState; notes: string[] }

    if (decision.cycleType === 'micro_pulse') {
      result = runMicroPulse(organism, background, now)
    } else if (decision.cycleType === 'weak_replay') {
      result = runWeakReplayTick(organism, background, now)
    } else {
      result = runMaintenanceTick(organism, background, now)
    }

    return {
      ran: true,
      cycleType: decision.cycleType,
      updatedOrganismState: result.organism,
      updatedBackgroundState: result.background,
      notes: result.notes,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      ran: false,
      updatedOrganismState: organism,
      updatedBackgroundState: {
        ...background,
        health: {
          ...background.health,
          skippedTicks: background.health.skippedTicks + 1,
          lastError: errorMsg,
        },
      },
      notes: [`background tick error: ${errorMsg}`],
    }
  }
}
