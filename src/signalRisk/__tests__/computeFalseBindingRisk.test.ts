import { describe, expect, it } from 'vitest'
import { computeFalseBindingRisk } from '../computeFalseBindingRisk'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import type { SignalPersonalBranch } from '../../signalBranch/signalBranchTypes'

describe('computeFalseBindingRisk', () => {
  it('returns 0 for empty branch', () => {
    expect(computeFalseBindingRisk(createInitialSignalPersonalBranch())).toBe(0)
  })

  it('increases with bridges with many failed recalls', () => {
    const branch: SignalPersonalBranch = {
      ...createInitialSignalPersonalBranch(),
      bridgeRecords: [
        { id: 'br1', sourceAssemblyId: 'a', targetAssemblyId: 'b', stage: 'tentative', createdBy: 'self_discovered',
          teacherConfirmCount: 0, selfRecallSuccessCount: 0, failedRecallCount: 5,
          confidence: 0.3, teacherDependencyScore: 0.2, recallSuccessScore: 0, lastUsedAt: Date.now() },
      ],
    }
    expect(computeFalseBindingRisk(branch)).toBeGreaterThan(0)
  })
})
