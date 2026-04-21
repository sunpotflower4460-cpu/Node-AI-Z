/**
 * Snapshot Catalog Tests
 * Phase M8: Snapshot generation management
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  addSnapshotCatalogEntry,
  sortSnapshotsNewestFirst,
  groupSnapshotsByStorage,
  groupSnapshotsByGeneration,
  getLatestByGeneration,
} from '../snapshotCatalog'
import type { SnapshotCatalogEntry } from '../types'

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

describe('snapshotCatalog', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('sortSnapshotsNewestFirst', () => {
    it('should sort snapshots by createdAt descending', () => {
      const entries: SnapshotCatalogEntry[] = [
        {
          snapshotId: 'snap-1',
          sessionId: 'session-1',
          createdAt: 1000,
          turnCount: 10,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-2',
          sessionId: 'session-1',
          createdAt: 3000,
          turnCount: 30,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-3',
          sessionId: 'session-1',
          createdAt: 2000,
          turnCount: 20,
          generation: 'turn',
          storageTarget: 'local',
        },
      ]

      const sorted = sortSnapshotsNewestFirst(entries)

      expect(sorted[0].snapshotId).toBe('snap-2')
      expect(sorted[1].snapshotId).toBe('snap-3')
      expect(sorted[2].snapshotId).toBe('snap-1')
    })
  })

  describe('groupSnapshotsByStorage', () => {
    it('should group snapshots by storage target', () => {
      const entries: SnapshotCatalogEntry[] = [
        {
          snapshotId: 'snap-1',
          sessionId: 'session-1',
          createdAt: 1000,
          turnCount: 10,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-2',
          sessionId: 'session-1',
          createdAt: 2000,
          turnCount: 20,
          generation: 'turn',
          storageTarget: 'remote',
        },
        {
          snapshotId: 'snap-3',
          sessionId: 'session-1',
          createdAt: 3000,
          turnCount: 30,
          generation: 'turn',
          storageTarget: 'local',
        },
      ]

      const grouped = groupSnapshotsByStorage(entries)

      expect(grouped.local).toHaveLength(2)
      expect(grouped.remote).toHaveLength(1)
      expect(grouped.local[0].snapshotId).toBe('snap-1')
      expect(grouped.remote[0].snapshotId).toBe('snap-2')
    })
  })

  describe('groupSnapshotsByGeneration', () => {
    it('should group snapshots by generation type', () => {
      const entries: SnapshotCatalogEntry[] = [
        {
          snapshotId: 'snap-1',
          sessionId: 'session-1',
          createdAt: 1000,
          turnCount: 10,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-2',
          sessionId: 'session-1',
          createdAt: 2000,
          turnCount: 20,
          generation: 'manual',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-3',
          sessionId: 'session-1',
          createdAt: 3000,
          turnCount: 30,
          generation: 'safety',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-4',
          sessionId: 'session-1',
          createdAt: 4000,
          turnCount: 40,
          generation: 'turn',
          storageTarget: 'local',
        },
      ]

      const grouped = groupSnapshotsByGeneration(entries)

      expect(grouped.turn).toHaveLength(2)
      expect(grouped.manual).toHaveLength(1)
      expect(grouped.safety).toHaveLength(1)
      expect(grouped.restore_checkpoint).toHaveLength(0)
    })
  })

  describe('getLatestByGeneration', () => {
    it('should return the latest snapshot for each generation', () => {
      const entries: SnapshotCatalogEntry[] = [
        {
          snapshotId: 'snap-1',
          sessionId: 'session-1',
          createdAt: 1000,
          turnCount: 10,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-2',
          sessionId: 'session-1',
          createdAt: 3000,
          turnCount: 30,
          generation: 'turn',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-3',
          sessionId: 'session-1',
          createdAt: 2000,
          turnCount: 20,
          generation: 'manual',
          storageTarget: 'local',
        },
      ]

      const latest = getLatestByGeneration(entries)

      expect(latest.turn?.snapshotId).toBe('snap-2')
      expect(latest.manual?.snapshotId).toBe('snap-3')
      expect(latest.safety).toBeUndefined()
    })
  })

  describe('addSnapshotCatalogEntry', () => {
    it('should add entry to catalog', () => {
      const entry: SnapshotCatalogEntry = {
        snapshotId: 'snap-1',
        sessionId: 'session-1',
        createdAt: Date.now(),
        turnCount: 10,
        generation: 'turn',
        storageTarget: 'local',
      }

      const result = addSnapshotCatalogEntry(entry)

      expect(result).toBe(true)
    })
  })
})
