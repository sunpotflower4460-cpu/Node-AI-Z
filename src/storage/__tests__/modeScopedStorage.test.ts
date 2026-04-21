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
    it('should generate correct key for jibun_kaigi_api mode', () => {
      const key = getModeStorageKey('jibun_kaigi_api', 'test-key')
      expect(key).toBe('nodeaiz:jibun:test-key')
    })

    it('should generate correct key for crystallized_thinking mode', () => {
      const key = getModeStorageKey('crystallized_thinking', 'test-key')
      expect(key).toBe('nodeaiz:crystal:test-key')
    })

    it('should generate different keys for different modes with same key name', () => {
      const jibunKey = getModeStorageKey('jibun_kaigi_api', 'data')
      const crystalKey = getModeStorageKey('crystallized_thinking', 'data')
      expect(jibunKey).not.toBe(crystalKey)
    })
  })

  describe('loadModeData', () => {
    it('should return default value when no data stored', () => {
      const result = loadModeData('jibun_kaigi_api', 'test', { default: true })
      expect(result).toEqual({ default: true })
    })

    it('should load stored data correctly', () => {
      const testData = { value: 'test' }
      saveModeData('jibun_kaigi_api', 'test', testData)
      const result = loadModeData('jibun_kaigi_api', 'test', {})
      expect(result).toEqual(testData)
    })

    it('should isolate data between modes', () => {
      const jibunData = { mode: 'jibun' }
      const crystalData = { mode: 'crystal' }

      saveModeData('jibun_kaigi_api', 'data', jibunData)
      saveModeData('crystallized_thinking', 'data', crystalData)

      expect(loadModeData('jibun_kaigi_api', 'data', {})).toEqual(jibunData)
      expect(loadModeData('crystallized_thinking', 'data', {})).toEqual(crystalData)
    })
  })

  describe('saveModeData', () => {
    it('should save data with mode-scoped key', () => {
      const testData = { test: 'value' }
      saveModeData('jibun_kaigi_api', 'test', testData)

      const key = getModeStorageKey('jibun_kaigi_api', 'test')
      const stored = localStorage.getItem(key)
      expect(stored).toBe(JSON.stringify(testData))
    })

    it('should not overwrite data from different mode', () => {
      const jibunData = { mode: 'jibun' }
      const crystalData = { mode: 'crystal' }

      saveModeData('jibun_kaigi_api', 'data', jibunData)
      saveModeData('crystallized_thinking', 'data', crystalData)

      expect(loadModeData('jibun_kaigi_api', 'data', {})).toEqual(jibunData)
      expect(loadModeData('crystallized_thinking', 'data', {})).toEqual(crystalData)
    })
  })

  describe('clearModeData', () => {
    it('should clear only data for specified mode', () => {
      const jibunData = { mode: 'jibun' }
      const crystalData = { mode: 'crystal' }

      saveModeData('jibun_kaigi_api', 'data1', jibunData)
      saveModeData('jibun_kaigi_api', 'data2', jibunData)
      saveModeData('crystallized_thinking', 'data1', crystalData)

      clearModeData('jibun_kaigi_api')

      // Jibun data should be cleared
      expect(loadModeData('jibun_kaigi_api', 'data1', null)).toBeNull()
      expect(loadModeData('jibun_kaigi_api', 'data2', null)).toBeNull()

      // Crystal data should remain
      expect(loadModeData('crystallized_thinking', 'data1', null)).toEqual(crystalData)
    })

    it('should not affect data from other modes', () => {
      saveModeData('jibun_kaigi_api', 'test', { value: 1 })
      saveModeData('crystallized_thinking', 'test', { value: 2 })

      clearModeData('jibun_kaigi_api')

      expect(loadModeData('crystallized_thinking', 'test', null)).toEqual({ value: 2 })
    })
  })

  describe('mode isolation', () => {
    it('should maintain complete separation between modes', () => {
      // Set up data for both modes
      const jibunMessages = ['msg1', 'msg2']
      const crystalMessages = ['msg3', 'msg4']

      saveModeData('jibun_kaigi_api', 'messages', jibunMessages)
      saveModeData('crystallized_thinking', 'messages', crystalMessages)

      // Verify isolation
      expect(loadModeData('jibun_kaigi_api', 'messages', [])).toEqual(jibunMessages)
      expect(loadModeData('crystallized_thinking', 'messages', [])).toEqual(crystalMessages)

      // Clear one mode
      clearModeData('jibun_kaigi_api')

      // Other mode should be unaffected
      expect(loadModeData('crystallized_thinking', 'messages', [])).toEqual(crystalMessages)
      expect(loadModeData('jibun_kaigi_api', 'messages', [])).toEqual([])
    })
  })
})
