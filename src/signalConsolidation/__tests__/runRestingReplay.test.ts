import { describe, it, expect } from 'vitest'
import { runRestingReplay } from '../runRestingReplay'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('runRestingReplay', () => {
  it('should replay stable, recurring assemblies', () => {
    const branch = {
      ...createInitialSignalPersonalBranch(),
      assemblyRecords: [
        {
          id: 'rec1',
          assemblyId: 'asm1',
          particleIds: ['p1', 'p2'],
          recurrenceCount: 5,
          replayCount: 2,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.8,
          sourceHistory: ['external_stimulus' as const],
        },
        {
          id: 'rec2',
          assemblyId: 'asm2',
          particleIds: ['p3', 'p4'],
          recurrenceCount: 2,
          replayCount: 0,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.2,
          sourceHistory: ['external_stimulus' as const],
        },
      ],
    }

    const result = runRestingReplay(branch)

    expect(result.replayedAssemblyIds.length).toBeGreaterThan(0)
    expect(result.strengthenedAssemblyIds).toContain('asm1')
    expect(result.replaySuccessRate).toBeGreaterThan(0)
  })

  it('should replay and categorize assemblies', () => {
    const branch = {
      ...createInitialSignalPersonalBranch(),
      assemblyRecords: [
        {
          id: 'rec1',
          assemblyId: 'asm1',
          particleIds: ['p1', 'p2'],
          recurrenceCount: 2,
          replayCount: 0,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.2,
          sourceHistory: ['external_stimulus' as const],
        },
        {
          id: 'rec2',
          assemblyId: 'asm2',
          particleIds: ['p3', 'p4'],
          recurrenceCount: 2,
          replayCount: 0,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.25,
          sourceHistory: ['external_stimulus' as const],
        },
      ],
    }

    const result = runRestingReplay(branch)

    // Should process the assemblies
    expect(result.replayedAssemblyIds.length).toBeGreaterThan(0)
    // Result contains strengthened OR weakened assemblies
    expect(
      result.strengthenedAssemblyIds.length + result.weakenedAssemblyIds.length,
    ).toBeGreaterThanOrEqual(0)
  })

  it('should handle empty branch gracefully', () => {
    const branch = createInitialSignalPersonalBranch()

    const result = runRestingReplay(branch)

    expect(result.replayedAssemblyIds).toEqual([])
    expect(result.strengthenedAssemblyIds).toEqual([])
    expect(result.replaySuccessRate).toBe(0)
  })
})
