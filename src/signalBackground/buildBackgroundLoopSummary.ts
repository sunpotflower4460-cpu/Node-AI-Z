import type { BackgroundLoopState } from './signalBackgroundTypes'

export type BackgroundLoopSummary = {
  mode: BackgroundLoopState['mode']
  isRunning: boolean
  tickCount: number
  lastCycleType?: BackgroundLoopState['lastCycleType']
  pendingReplayCount: number
  loopLoad: number
  skippedTicks: number
  lastTickAt?: number
  lastError?: string
}

/**
 * Builds a compact summary of the background loop state for UI display.
 */
export function buildBackgroundLoopSummary(state: BackgroundLoopState): BackgroundLoopSummary {
  return {
    mode: state.mode,
    isRunning: state.isRunning,
    tickCount: state.tickCount,
    lastCycleType: state.lastCycleType,
    pendingReplayCount: state.pendingReplayIds.length,
    loopLoad: state.health.loopLoad,
    skippedTicks: state.health.skippedTicks,
    lastTickAt: state.lastTickAt,
    lastError: state.health.lastError,
  }
}
