import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'

/**
 * Background Loop Types for New Signal Mode.
 *
 * Manages lightweight background cycles that keep the internal state
 * alive even when there is no external input.
 */

export type BackgroundLoopMode = 'awake' | 'idle' | 'quiet' | 'replay' | 'maintenance'

export type BackgroundLoopState = {
  mode: BackgroundLoopMode
  isRunning: boolean
  lastTickAt?: number
  tickCount: number

  lastCycleType?: 'micro_pulse' | 'weak_replay' | 'maintenance'
  pendingReplayIds: string[]
  pendingMaintenanceTasks: string[]

  health: {
    loopLoad: number
    skippedTicks: number
    lastError?: string
  }
}

export type BackgroundTickResult = {
  ran: boolean
  cycleType?: 'micro_pulse' | 'weak_replay' | 'maintenance'
  updatedOrganismState: PersistentOrganismState
  updatedBackgroundState: BackgroundLoopState
  notes: string[]
}

/** Timeline entry for the BackgroundActivityTimeline UI */
export type BackgroundActivityEntry = {
  timestamp: number
  cycleType: 'micro_pulse' | 'weak_replay' | 'maintenance' | 'snapshot_saved'
  note: string
}
