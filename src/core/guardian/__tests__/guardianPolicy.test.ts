/**
 * Guardian Policy Tests - Phase M11
 */

import { describe, it, expect } from 'vitest'
import { resolveGuardianMode, defaultGuardianPolicy } from '../guardianPolicy'
import type { GuardianPolicy } from '../guardianTypes'

describe('Guardian Policy', () => {
  describe('resolveGuardianMode', () => {
    it('should return human_required for high risk when policy requires it', () => {
      const policy: GuardianPolicy = {
        mode: 'guardian_assisted',
        autoApproveLowRisk: true,
        requireGuardianForMediumRisk: true,
        requireHumanForHighRisk: true,
      }

      const mode = resolveGuardianMode('high', policy)
      expect(mode).toBe('human_required')
    })

    it('should return guardian_assisted for medium risk when policy requires guardian', () => {
      const policy: GuardianPolicy = {
        mode: 'system_only',
        autoApproveLowRisk: true,
        requireGuardianForMediumRisk: true,
        requireHumanForHighRisk: false,
      }

      const mode = resolveGuardianMode('medium', policy)
      expect(mode).toBe('guardian_assisted')
    })

    it('should return system_only for low risk when auto-approve is enabled', () => {
      const policy: GuardianPolicy = {
        mode: 'guardian_assisted',
        autoApproveLowRisk: true,
        requireGuardianForMediumRisk: false,
        requireHumanForHighRisk: false,
      }

      const mode = resolveGuardianMode('low', policy)
      expect(mode).toBe('system_only')
    })

    it('should default to policy mode when no specific rule matches', () => {
      const policy: GuardianPolicy = {
        mode: 'guardian_assisted',
        autoApproveLowRisk: false,
        requireGuardianForMediumRisk: false,
        requireHumanForHighRisk: false,
      }

      const mode = resolveGuardianMode('low', policy)
      expect(mode).toBe('guardian_assisted')
    })
  })

  describe('defaultGuardianPolicy', () => {
    it('should have guardian_assisted as default mode', () => {
      expect(defaultGuardianPolicy.mode).toBe('guardian_assisted')
    })

    it('should auto-approve low risk', () => {
      expect(defaultGuardianPolicy.autoApproveLowRisk).toBe(true)
    })

    it('should require guardian for medium risk', () => {
      expect(defaultGuardianPolicy.requireGuardianForMediumRisk).toBe(true)
    })

    it('should require human for high risk', () => {
      expect(defaultGuardianPolicy.requireHumanForHighRisk).toBe(true)
    })
  })
})
