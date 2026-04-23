import { describe, it, expect, beforeEach } from 'vitest'
import { getModeStorageKey, loadModeData, saveModeData, clearModeData } from '../modeScopedStorage'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length
    },
  }
})()

global.localStorage = mockLocalStorage as Storage

describe('modeScopedStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('getModeStorageKey', () => {
    it('should generate correct key for llm_mode mode', () => {
      const key = getModeStorageKey('llm_mode', 'test-key')
      expect(key).toBe('nodeaiz:llm:test-key')
    })

    it('should generate correct key for crystallized_thinking mode', () => {
      const key = getModeStorageKey('crystallized_thinking', 'test-key')
      expect(key).toBe('nodeaiz:crystal:test-key')
    })

    it('should generate different keys for different modes with same key name', () => {
      const llmKey = getModeStorageKey('llm_mode', 'data')
      const crystalKey = getModeStorageKey('crystallized_thinking', 'data')
      expect(llmKey).not.toBe(crystalKey)
    })
  })

  describe('loadModeData', () => {
    it('should return default value when no data stored', () => {
      const result = loadModeData('llm_mode', 'test', { default: true })
      expect(result).toEqual({ default: true })
    })

    it('should load stored data correctly', () => {
      const testData = { value: 'test' }
      saveModeData('llm_mode', 'test', testData)
      const result = loadModeData('llm_mode', 'test', {})
      expect(result).toEqual(testData)
    })

    it('should isolate data between modes', () => {
      const llmData = { mode: 'llm' }
      const crystalData = { mode: 'crystal' }

      saveModeData('llm_mode', 'data', llmData)
      saveModeData('crystallized_thinking', 'data', crystalData)

      expect(loadModeData('llm_mode', 'data', {})).toEqual(llmData)
      expect(loadModeData('crystallized_thinking', 'data', {})).toEqual(crystalData)
    })
  })

  describe('saveModeData', () => {
    it('should save data with mode-scoped key', () => {
      const testData = { test: 'value' }
      saveModeData('llm_mode', 'test', testData)

      const key = getModeStorageKey('llm_mode', 'test')
      const stored = localStorage.getItem(key)
      expect(stored).toBe(JSON.stringify(testData))
    })

    it('should not overwrite data from different mode', () => {
      const llmData = { mode: 'llm' }
      const crystalData = { mode: 'crystal' }

      saveModeData('llm_mode', 'data', llmData)
      saveModeData('crystallized_thinking', 'data', crystalData)

      expect(loadModeData('llm_mode', 'data', {})).toEqual(llmData)
      expect(loadModeData('crystallized_thinking', 'data', {})).toEqual(crystalData)
    })
  })

  describe('clearModeData', () => {
    it('should clear only data for specified mode', () => {
      const llmData = { mode: 'llm' }
      const crystalData = { mode: 'crystal' }

      saveModeData('llm_mode', 'data1', llmData)
      saveModeData('llm_mode', 'data2', llmData)
      saveModeData('crystallized_thinking', 'data1', crystalData)

      clearModeData('llm_mode')

      // LLM data should be cleared
      expect(loadModeData('llm_mode', 'data1', null)).toBeNull()
      expect(loadModeData('llm_mode', 'data2', null)).toBeNull()

      // Crystal data should remain
      expect(loadModeData('crystallized_thinking', 'data1', null)).toEqual(crystalData)
    })

    it('should not affect data from other modes', () => {
      saveModeData('llm_mode', 'test', { value: 1 })
      saveModeData('crystallized_thinking', 'test', { value: 2 })

      clearModeData('llm_mode')

      expect(loadModeData('crystallized_thinking', 'test', null)).toEqual({ value: 2 })
    })
  })

  describe('mode isolation', () => {
    it('should maintain complete separation between modes', () => {
      // Set up data for both modes
      const llmMessages = ['msg1', 'msg2']
      const crystalMessages = ['msg3', 'msg4']

      saveModeData('llm_mode', 'messages', llmMessages)
      saveModeData('crystallized_thinking', 'messages', crystalMessages)

      // Verify isolation
      expect(loadModeData('llm_mode', 'messages', [])).toEqual(llmMessages)
      expect(loadModeData('crystallized_thinking', 'messages', [])).toEqual(crystalMessages)

      // Clear one mode
      clearModeData('llm_mode')

      // Other mode should be unaffected
      expect(loadModeData('crystallized_thinking', 'messages', [])).toEqual(crystalMessages)
      expect(loadModeData('llm_mode', 'messages', [])).toEqual([])
    })
  })
})
