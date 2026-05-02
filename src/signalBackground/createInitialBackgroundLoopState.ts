import type { BackgroundLoopState } from './signalBackgroundTypes'

/**
 * Creates the initial background loop state for New Signal Mode.
 */
export function createInitialBackgroundLoopState(): BackgroundLoopState {
  return {
    mode: 'idle',
    isRunning: false,
    lastTickAt: undefined,
    tickCount: 0,
    lastCycleType: undefined,
    pendingReplayIds: [],
    pendingMaintenanceTasks: [],
    health: {
      loopLoad: 0,
      skippedTicks: 0,
      lastError: undefined,
    },
  }
}
