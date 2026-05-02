import type { OrganismSummary } from '../../signalOrganism/buildOrganismSummary'
import type { BackgroundLoopSummary } from '../../signalBackground/buildBackgroundLoopSummary'

export type BackgroundViewModel = {
  organism: {
    energy: number
    curiosity: number
    uncertainty: number
    safety: number
    replayPressure: number
    teacherDependency: number
    selfEcho: number
    internalRhythm: number
    regulationLabel: string
    turnCount: number
    totalInputCount: number
    backgroundTickCount: number
    totalReplayCount: number
  }
  background: {
    mode: string
    isRunning: boolean
    tickCount: number
    lastCycleType: string
    pendingReplayCount: number
    loopLoad: number
    skippedTicks: number
    lastTickAgo: string
    hasError: boolean
    lastError?: string
  }
}

function formatTimeAgo(lastTickAt?: number): string {
  if (lastTickAt === undefined) return 'never'
  const seconds = Math.floor((Date.now() - lastTickAt) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

/**
 * Builds a view model for the background loop and organism UI panels.
 */
export function buildBackgroundViewModel(
  organism: OrganismSummary,
  background: BackgroundLoopSummary,
): BackgroundViewModel {
  return {
    organism: {
      energy: organism.energy,
      curiosity: organism.curiosity,
      uncertainty: organism.uncertainty,
      safety: organism.safety,
      replayPressure: organism.replayPressure,
      teacherDependency: organism.teacherDependency,
      selfEcho: organism.selfEcho,
      internalRhythm: organism.internalRhythm,
      regulationLabel: organism.regulationLabel,
      turnCount: organism.turnCount,
      totalInputCount: organism.totalInputCount,
      backgroundTickCount: organism.backgroundTickCount,
      totalReplayCount: organism.totalReplayCount,
    },
    background: {
      mode: background.mode,
      isRunning: background.isRunning,
      tickCount: background.tickCount,
      lastCycleType: background.lastCycleType ?? 'none',
      pendingReplayCount: background.pendingReplayCount,
      loopLoad: background.loopLoad,
      skippedTicks: background.skippedTicks,
      lastTickAgo: formatTimeAgo(background.lastTickAt),
      hasError: background.lastError !== undefined,
      lastError: background.lastError,
    },
  }
}
