import type { ExperienceMessage } from '../types/experience'

const STORAGE_KEY = 'node-ai-z:experience-messages'

export const loadExperienceMessages = (): ExperienceMessage[] => {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load experience messages. Stored data may be corrupted; clear local storage or retry in a private window.', error)
    return []
  }
}

export const saveExperienceMessages = (messages: ExperienceMessage[]): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch (error) {
    console.error('Failed to save experience messages. Storage may be full or unavailable; clear local storage and try again.', error)
  }
}
