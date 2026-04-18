import type { ImplementationMode } from '../types/experience'

/**
 * Storage key prefix for mode-scoped data
 */
const MODE_STORAGE_PREFIX = {
  jibun_kaigi_api: 'nodeaiz:jibun',
  crystallized_thinking: 'nodeaiz:crystal',
} as const

/**
 * Get mode-specific storage key
 */
export const getModeStorageKey = (mode: ImplementationMode, key: string): string => {
  return `${MODE_STORAGE_PREFIX[mode]}:${key}`
}

/**
 * Load data from mode-scoped storage
 */
export const loadModeData = <T>(mode: ImplementationMode, key: string, defaultValue: T): T => {
  if (typeof localStorage === 'undefined') {
    return defaultValue
  }

  try {
    const storageKey = getModeStorageKey(mode, key)
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return defaultValue
    }

    return JSON.parse(stored) as T
  } catch (error) {
    console.error(`Failed to load mode data for ${mode}:${key}`, error)
    return defaultValue
  }
}

/**
 * Save data to mode-scoped storage
 */
export const saveModeData = <T>(mode: ImplementationMode, key: string, data: T): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const storageKey = getModeStorageKey(mode, key)
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save mode data for ${mode}:${key}`, error)
  }
}

/**
 * Clear all data for a specific mode
 */
export const clearModeData = (mode: ImplementationMode): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const prefix = MODE_STORAGE_PREFIX[mode]
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error(`Failed to clear mode data for ${mode}`, error)
  }
}
