import { describe, it, expect } from 'vitest'
import { shouldRunConsolidation } from '../shouldRunConsolidation'
import { createConsolidationState } from '../createConsolidationState'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('shouldRunConsolidation', () => {
  it('should not run if user is active', () => {
    const consolidationState = createConsolidationState()
    const branch = createInitialSignalPersonalBranch()

    const result = shouldRunConsolidation(
      {
        now: Date.now(),
        isUserActive: true,
        recentActivityLevel: 0.3,
      },
      consolidationState,
      branch,
    )

    expect(result).toBe(false)
  })

  it('should not run if activity level is too high', () => {
    const consolidationState = createConsolidationState()
    const branch = createInitialSignalPersonalBranch()

    const result = shouldRunConsolidation(
      {
        now: Date.now(),
        isUserActive: false,
        recentActivityLevel: 0.8,
      },
      consolidationState,
      branch,
    )

    expect(result).toBe(false)
  })

  it('should not run if too soon since last consolidation', () => {
    const consolidationState = createConsolidationState()
    const branch = {
      ...createInitialSignalPersonalBranch(),
      assemblyRecords: [{
        id: 'rec1',
        assemblyId: 'asm1',
        particleIds: ['p1', 'p2'],
        recurrenceCount: 5,
        replayCount: 2,
        lastActivatedAt: Date.now(),
        stabilityScore: 0.7,
        sourceHistory: ['external_stimulus' as const],
      }],
    }

    const result = shouldRunConsolidation(
      {
        now: Date.now() + 5000, // Only 5 seconds later
        isUserActive: false,
        recentActivityLevel: 0.3,
      },
      consolidationState,
      branch,
    )

    expect(result).toBe(false)
  })

  it('should run when conditions are met', () => {
    const consolidationState = {
      ...createConsolidationState(),
      lastConsolidatedAt: Date.now() - 60000, // 1 minute ago
    }
    const branch = {
      ...createInitialSignalPersonalBranch(),
      assemblyRecords: Array(5).fill(null).map((_, i) => ({
        id: `rec${i}`,
        assemblyId: `asm${i}`,
        particleIds: [`p${i}1`, `p${i}2`],
        recurrenceCount: 3,
        replayCount: 1,
        lastActivatedAt: Date.now(),
        stabilityScore: 0.6,
        sourceHistory: ['external_stimulus' as const],
      })),
    }

    const result = shouldRunConsolidation(
      {
        now: Date.now(),
        isUserActive: false,
        recentActivityLevel: 0.2,
      },
      consolidationState,
      branch,
    )

    expect(result).toBe(true)
  })
})
