import type { LayeredBrainState } from '../runtime/layeredThinkingTypes'

const STORAGE_KEY = 'nodeaiz:layered:brain'

export const loadLayeredBrainState = (): LayeredBrainState | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return undefined
    }

    return JSON.parse(stored) as LayeredBrainState
  } catch (error) {
    console.warn('Failed to load layered brain state:', error)
    return undefined
  }
}

export const saveLayeredBrainState = (state: LayeredBrainState): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (error) {
    console.warn('Failed to save layered brain state:', error)
    return false
  }
}

export const clearLayeredBrainState = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear layered brain state:', error)
    return false
  }
}
