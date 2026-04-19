/**
 * Session Brain Storage
 * Local persistence for SessionBrainState using localStorage.
 * Enables continuity across page reloads and app restarts (until app deletion).
 */

import type { SessionBrainState } from '../brain/sessionBrainState'
import type { TemporalFeatureState } from '../signal/temporalTypes'

const STORAGE_KEY = 'nodeaiz:crystal:session-brain'

/**
 * Serializes SessionBrainState to JSON-compatible format.
 * Converts Map to array for JSON storage.
 */
const serializeBrainState = (state: SessionBrainState): string => {
  const serializable = {
    ...state,
    temporalStates: Array.from(state.temporalStates.entries()),
  }
  return JSON.stringify(serializable)
}

/**
 * Deserializes SessionBrainState from JSON format.
 * Converts array back to Map.
 */
const deserializeBrainState = (json: string): SessionBrainState => {
  const parsed = JSON.parse(json)
  return {
    ...parsed,
    temporalStates: new Map<string, TemporalFeatureState>(parsed.temporalStates ?? []),
  }
}

/**
 * Loads SessionBrainState from localStorage.
 * Returns undefined if no state exists or if loading fails.
 */
export const loadSessionBrainState = (): SessionBrainState | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return undefined
    }
    return deserializeBrainState(stored)
  } catch (error) {
    console.warn('Failed to load session brain state:', error)
    return undefined
  }
}

/**
 * Saves SessionBrainState to localStorage.
 * Returns true if successful, false otherwise.
 */
export const saveSessionBrainState = (state: SessionBrainState): boolean => {
  try {
    const serialized = serializeBrainState(state)
    localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch (error) {
    console.warn('Failed to save session brain state:', error)
    return false
  }
}

/**
 * Clears SessionBrainState from localStorage.
 * Returns true if successful, false otherwise.
 */
export const clearSessionBrainState = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear session brain state:', error)
    return false
  }
}
