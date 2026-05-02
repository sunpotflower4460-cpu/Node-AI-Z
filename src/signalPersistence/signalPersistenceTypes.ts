export type SignalModeSnapshot = {
  id: string
  version: number
  createdAt: number
  updatedAt: number

  signalFieldState: unknown
  signalPersonalBranch: unknown
  signalLoopState: unknown

  attentionBudget?: unknown
  modulatorState?: unknown
  outcomeMemory?: unknown
  predictionMemory?: unknown
  developmentState?: unknown
  consolidationState?: unknown

  contrastState?: unknown
  sequenceState?: unknown
  dreamState?: unknown
  inquiryState?: unknown

  /** Persistent organism state (added in Phase 1) */
  organismState?: unknown
  /** Background loop state (added in Phase 1) */
  backgroundLoopState?: unknown

  metadata: {
    mode: 'signal_mode'
    particleCount?: number
    assemblyCount?: number
    bridgeCount?: number
    protoSeedCount?: number
    developmentStage?: string
  }
}

export type SignalPersistenceSummary = {
  hasSnapshot: boolean
  snapshotId?: string
  version?: number
  updatedAt?: number
  particleCount?: number
  assemblyCount?: number
  bridgeCount?: number
  protoSeedCount?: number
  developmentStage?: string
  warnings: string[]
}

export const SIGNAL_SNAPSHOT_VERSION = 2

export type SignalStorageAdapter = {
  save: (key: string, value: unknown) => Promise<void>
  load: (key: string) => Promise<unknown | null>
  remove: (key: string) => Promise<void>
}
