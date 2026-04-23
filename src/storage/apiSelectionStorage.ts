import type { ApiProviderId, ApiSelectionState } from '../types/apiProvider'
import { getModeStorageKey } from './modeScopedStorage'

const API_SELECTION_KEY = 'api-selection'

const DEFAULT_PROVIDER: ApiProviderId = 'internal_mock'

const isApiProviderId = (value: unknown): value is ApiProviderId => {
  return value === 'internal_mock' || value === 'openai' || value === 'anthropic' || value === 'google'
}

const createDefaultApiSelection = (): ApiSelectionState => ({
  baseProvider: DEFAULT_PROVIDER,
  lastUpdatedAt: new Date().toISOString(),
})

/**
 * Load API selection state for llm_mode
 * (Crystallized thinking mode does not use provider selection)
 */
export const loadApiSelection = (): ApiSelectionState => {
  if (typeof localStorage === 'undefined') {
    return createDefaultApiSelection()
  }

  try {
    const storageKey = getModeStorageKey('llm_mode', API_SELECTION_KEY)
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return createDefaultApiSelection()
    }

    const parsed = JSON.parse(stored) as Partial<ApiSelectionState>
    if (!isApiProviderId(parsed.baseProvider)) {
      return createDefaultApiSelection()
    }

    return {
      baseProvider: parsed.baseProvider,
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'string' ? parsed.lastUpdatedAt : new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to load API selection from localStorage.', error)
    return createDefaultApiSelection()
  }
}

/**
 * Save API selection state for llm_mode
 */
export const saveApiSelection = (state: ApiSelectionState): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const storageKey = getModeStorageKey('llm_mode', API_SELECTION_KEY)
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save API selection to localStorage.', error)
  }
}

