/**
 * Snapshot Retention Tests
 * Phase M8: Snapshot generation management
 */

import { describe, it, expect } from 'vitest'
import {
  applySnapshotRetention,
  DEFAULT_RETENTION_POLICY,
  createRetentionPolicy,
} from '../snapshotRetention'
import type { SnapshotCatalogEntry } from '../types'

describe('snapshotRetention', () => {
  describe('applySnapshotRetention', () => {
    it('should keep recent snapshots based on policy', () => {
      const entries: SnapshotCatalogEntry[] = []

      // Create 15 turn snapshots
      for (let i = 0; i < 15; i++) {
        entries.push({
          snapshotId: `turn-${i}`,
          sessionId: 'session-1',
          createdAt: 1000 + i * 1000,
          turnCount: i * 10,
          generation: 'turn',
          storageTarget: 'local',
        })
      }

      // Create 10 manual snapshots
      for (let i = 0; i < 10; i++) {
        entries.push({
          snapshotId: `manual-${i}`,
          sessionId: 'session-1',
          createdAt: 20000 + i * 1000,
          turnCount: 100 + i * 10,
          generation: 'manual',
          storageTarget: 'local',
        })
      }

      const result = applySnapshotRetention(entries, DEFAULT_RETENTION_POLICY)

      // Should keep 10 turn snapshots (policy default)
      expect(result.summary.byGeneration.turn.kept).toBe(10)
      expect(result.summary.byGeneration.turn.pruned).toBe(5)

      // Should keep all 10 manual snapshots (within policy limit of 20)
      expect(result.summary.byGeneration.manual.kept).toBe(10)
      expect(result.summary.byGeneration.manual.pruned).toBe(0)

      expect(result.summary.total).toBe(25)
      expect(result.summary.kept).toBe(20)
      expect(result.summary.pruned).toBe(5)
    })

    it('should keep most recent snapshots', () => {
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

      const policy = createRetentionPolicy({ turn: 2 })
      const result = applySnapshotRetention(entries, policy)

      expect(result.kept).toHaveLength(2)
      expect(result.pruned).toHaveLength(1)

      // Most recent two should be kept
      expect(result.kept.find(e => e.snapshotId === 'snap-2')).toBeDefined()
      expect(result.kept.find(e => e.snapshotId === 'snap-3')).toBeDefined()

      // Oldest should be pruned
      expect(result.pruned.find(e => e.snapshotId === 'snap-1')).toBeDefined()
    })

    it('should handle empty entries', () => {
      const result = applySnapshotRetention([], DEFAULT_RETENTION_POLICY)

      expect(result.summary.total).toBe(0)
      expect(result.summary.kept).toBe(0)
      expect(result.summary.pruned).toBe(0)
    })

    it('should not prune if under limit', () => {
      const entries: SnapshotCatalogEntry[] = [
        {
          snapshotId: 'snap-1',
          sessionId: 'session-1',
          createdAt: 1000,
          turnCount: 10,
          generation: 'safety',
          storageTarget: 'local',
        },
        {
          snapshotId: 'snap-2',
          sessionId: 'session-1',
          createdAt: 2000,
          turnCount: 20,
          generation: 'safety',
          storageTarget: 'local',
        },
      ]

      const result = applySnapshotRetention(entries, DEFAULT_RETENTION_POLICY)

      // Safety policy keeps 5, we only have 2
      expect(result.summary.byGeneration.safety.kept).toBe(2)
      expect(result.summary.byGeneration.safety.pruned).toBe(0)
    })
  })

  describe('createRetentionPolicy', () => {
    it('should merge overrides with defaults', () => {
      const policy = createRetentionPolicy({
        turn: 20,
        safety: 10,
      })

      expect(policy.turn).toBe(20)
      expect(policy.safety).toBe(10)
      expect(policy.manual).toBe(DEFAULT_RETENTION_POLICY.manual)
      expect(policy.restore_checkpoint).toBe(DEFAULT_RETENTION_POLICY.restore_checkpoint)
    })
  })
})
