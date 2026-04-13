import type { RevisionState, MemoryState, UserTuningState } from './revisionTypes'
import { createDefaultPlasticityState } from './defaultPlasticityState'

export const createDefaultMemoryState = (): MemoryState => ({
  entries: [],
  promoted: [],
  ephemeral: [],
  maxEphemeralSize: 50,
  lastCleanup: new Date().toISOString(),
})

export const createDefaultUserTuningState = (): UserTuningState => ({
  locked: new Set<string>(),
  softened: new Set<string>(),
  reverted: new Set<string>(),
  kept: new Set<string>(),
})

export const createDefaultRevisionState = (): RevisionState => ({
  plasticity: createDefaultPlasticityState(),
  memory: createDefaultMemoryState(),
  tuning: createDefaultUserTuningState(),
})
