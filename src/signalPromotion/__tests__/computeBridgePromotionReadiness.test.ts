import { describe, it, expect } from 'vitest'
import { computeBridgePromotionReadiness } from '../computeBridgePromotionReadiness'
import type { SignalBridgeRecord } from '../../signalBranch/signalBranchTypes'

describe('computeBridgePromotionReadiness', () => {
  it('should identify teacher-free bridges as ready', () => {
    const bridge: SignalBridgeRecord = {
      id: 'bridge1',
      sourceAssemblyId: 'asm1',
      targetAssemblyId: 'asm2',
      stage: 'teacher_free',
      createdBy: 'self_discovered',
      teacherConfirmCount: 0,
      selfRecallSuccessCount: 10,
      failedRecallCount: 1,
      confidence: 0.9,
      teacherDependencyScore: 0.1,
      recallSuccessScore: 0.9,
      lastUsedAt: Date.now(),
    }

    const readiness = computeBridgePromotionReadiness(bridge)

    expect(readiness.readinessScore).toBeGreaterThan(0.7)
    expect(readiness.teacherIndependenceScore).toBeGreaterThan(0.8)
    expect(readiness.recommendedAction).toBe('candidate_for_mother_export')
  })

  it('should wait for teacher-dependent bridges', () => {
    const bridge: SignalBridgeRecord = {
      id: 'bridge1',
      sourceAssemblyId: 'asm1',
      targetAssemblyId: 'asm2',
      stage: 'teacher_light',
      createdBy: 'binding_teacher',
      teacherConfirmCount: 10,
      selfRecallSuccessCount: 2,
      failedRecallCount: 5,
      confidence: 0.6,
      teacherDependencyScore: 0.8,
      recallSuccessScore: 0.3,
      lastUsedAt: Date.now(),
    }

    const readiness = computeBridgePromotionReadiness(bridge)

    expect(readiness.teacherIndependenceScore).toBeLessThan(0.3)
    expect(readiness.recommendedAction).toBe('wait')
  })
})
