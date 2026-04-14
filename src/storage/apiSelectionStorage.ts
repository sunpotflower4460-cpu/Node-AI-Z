import type { ApiProviderId, ApiSelectionState } from '../types/apiProvider'

export const API_SELECTION_STORAGE_KEY = 'node-ai-z:api-selection'

const DEFAULT_PROVIDER: ApiProviderId = 'internal_mock'

const isApiProviderId = (value: unknown): value is ApiProviderId => {
  return value === 'internal_mock' || value === 'openai' || value === 'anthropic' || value === 'google'
}

const createDefaultApiSelection = (): ApiSelectionState => ({
  baseProvider: DEFAULT_PROVIDER,
  lastUpdatedAt: new Date().toISOString(),
})

export const loadApiSelection = (): ApiSelectionState => {
  if (typeof localStorage === 'undefined') {
    return createDefaultApiSelection()
  }

  try {
    const stored = localStorage.getItem(API_SELECTION_STORAGE_KEY)
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

export const saveApiSelection = (state: ApiSelectionState): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(API_SELECTION_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save API selection to localStorage.', error)
  }
}
