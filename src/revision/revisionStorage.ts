import type { RevisionState } from './revisionTypes'
import { createDefaultMemoryState, createDefaultRevisionState, createDefaultUserTuningState } from './defaultRevisionState'
import { createDefaultPlasticityState } from './defaultPlasticityState'
import { syncRevisionState } from './revisionLog'

const STORAGE_KEY = 'node-ai-z:revision-state'

/**
 * Serialize RevisionState for localStorage
 * Note: Set objects need special handling for JSON
 */
const serializeRevisionState = (state: RevisionState): string => {
  const serializable = {
    plasticity: state.plasticity,
    memory: state.memory,
    tuning: {
      locked: Array.from(state.tuning.locked),
      softened: Array.from(state.tuning.softened),
      reverted: Array.from(state.tuning.reverted),
      kept: Array.from(state.tuning.kept),
    },
  }
  return JSON.stringify(serializable)
}

/**
 * Deserialize RevisionState from localStorage
 */
const deserializeRevisionState = (json: string): RevisionState => {
  const parsed = JSON.parse(json)
  const defaultPlasticity = createDefaultPlasticityState()
  const defaultMemory = createDefaultMemoryState()
  const defaultTuning = createDefaultUserTuningState()

  return syncRevisionState({
    plasticity: {
      ...defaultPlasticity,
      ...(parsed.plasticity || {}),
      nodeBoosts: parsed.plasticity?.nodeBoosts || {},
      relationBoosts: parsed.plasticity?.relationBoosts || {},
      patternBoosts: parsed.plasticity?.patternBoosts || {},
      // Backward compatibility for SRM-1 persisted state.
      homeTriggerBoosts: parsed.plasticity?.homeTriggerBoosts || parsed.plasticity?.homeTriggerAdjust || {},
      // Backward compatibility for SRM-1 persisted state.
      toneBiases: parsed.plasticity?.toneBiases || parsed.plasticity?.toneBias || {},
      lastUpdated: parsed.plasticity?.lastUpdated || defaultPlasticity.lastUpdated,
    },
    memory: {
      ...defaultMemory,
      ...(parsed.memory || {}),
      entries: parsed.memory?.entries || [],
      promoted: parsed.memory?.promoted || [],
      ephemeral: parsed.memory?.ephemeral || [],
      maxEphemeralSize: parsed.memory?.maxEphemeralSize || defaultMemory.maxEphemeralSize,
      lastCleanup: parsed.memory?.lastCleanup || defaultMemory.lastCleanup,
    },
    tuning: {
      ...defaultTuning,
      locked: new Set(parsed.tuning?.locked || []),
      softened: new Set(parsed.tuning?.softened || []),
      reverted: new Set(parsed.tuning?.reverted || []),
      kept: new Set(parsed.tuning?.kept || []),
    },
  })
}

export const loadRevisionState = (): RevisionState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return createDefaultRevisionState()
    }
    return deserializeRevisionState(stored)
  } catch (error) {
    console.error('Failed to load revision state:', error)
    return createDefaultRevisionState()
  }
}

export const saveRevisionState = (state: RevisionState): void => {
  try {
    const serialized = serializeRevisionState(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save revision state:', error)
  }
}

export const clearRevisionState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear revision state:', error)
  }
}
