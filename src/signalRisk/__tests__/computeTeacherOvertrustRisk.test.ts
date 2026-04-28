import { describe, expect, it } from 'vitest'
import { computeTeacherOvertrustRisk } from '../computeTeacherOvertrustRisk'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import type { SignalPersonalBranch } from '../../signalBranch/signalBranchTypes'

describe('computeTeacherOvertrustRisk', () => {
  it('returns 0 for empty branch', () => {
    expect(computeTeacherOvertrustRisk(createInitialSignalPersonalBranch())).toBe(0)
  })

  it('returns high risk when teacher confirm count high but self recall low', () => {
    const branch: SignalPersonalBranch = {
      ...createInitialSignalPersonalBranch(),
      bridgeRecords: Array.from({ length: 5 }, (_, i) => ({
        id: `br${i}`, sourceAssemblyId: 'a', targetAssemblyId: 'b', stage: 'reinforced' as const,
        createdBy: 'binding_teacher' as const, teacherConfirmCount: 5, selfRecallSuccessCount: 0,
        failedRecallCount: 0, confidence: 0.7, teacherDependencyScore: 0.8,
        recallSuccessScore: 0, lastUsedAt: Date.now(),
      })),
      summary: { assemblyCount: 0, bridgeCount: 5, protoSeedCount: 0, teacherFreeBridgeCount: 0, averageTeacherDependency: 0.8, averageRecallSuccess: 0 },
    }
    const risk = computeTeacherOvertrustRisk(branch)
    expect(risk).toBeGreaterThan(0.3)
  })
})
