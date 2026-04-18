import type { ExperienceMessage, ImplementationMode } from '../types/experience'
import { getModeStorageKey } from './modeScopedStorage'

const EXPERIENCE_MESSAGES_KEY = 'experience-messages'

/**
 * Load experience messages for a specific implementation mode
 */
export const loadExperienceMessages = (mode: ImplementationMode): ExperienceMessage[] => {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const storageKey = getModeStorageKey(mode, EXPERIENCE_MESSAGES_KEY)
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load experience messages from localStorage.', error)
    return []
  }
}

/**
 * Save experience messages for a specific implementation mode
 */
export const saveExperienceMessages = (mode: ImplementationMode, messages: ExperienceMessage[]): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const storageKey = getModeStorageKey(mode, EXPERIENCE_MESSAGES_KEY)
    localStorage.setItem(storageKey, JSON.stringify(messages))
  } catch (error) {
    console.error('Failed to save experience messages to localStorage.', error)
  }
}

