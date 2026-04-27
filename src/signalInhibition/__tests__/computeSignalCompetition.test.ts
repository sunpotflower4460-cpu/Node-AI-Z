import { describe, it, expect } from 'vitest'
import { computeSignalCompetition } from '../computeSignalCompetition'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('computeSignalCompetition', () => {
  it('should identify dominant assemblies', () => {
    const branch = {
      ...createInitialSignalPersonalBranch(),
      assemblyRecords: [
        {
          id: 'rec1',
          assemblyId: 'asm1',
          particleIds: ['p1', 'p2'],
          recurrenceCount: 10,
          replayCount: 5,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.9,
          sourceHistory: ['external_stimulus' as const],
        },
        {
          id: 'rec2',
          assemblyId: 'asm2',
          particleIds: ['p3', 'p4'],
          recurrenceCount: 3,
          replayCount: 1,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.5,
          sourceHistory: ['external_stimulus' as const],
        },
        {
          id: 'rec3',
          assemblyId: 'asm3',
          particleIds: ['p5', 'p6'],
          recurrenceCount: 1,
          replayCount: 0,
          lastActivatedAt: Date.now(),
          stabilityScore: 0.2,
          sourceHistory: ['external_stimulus' as const],
        },
      ],
    }

    const result = computeSignalCompetition(branch, ['asm1', 'asm2', 'asm3'])

    expect(result.dominantAssemblyIds).toContain('asm1')
    expect(result.suppressedAssemblyIds).toContain('asm3')
    expect(result.inhibitionStrength).toBeGreaterThan(0)
  })

  it('should handle empty active assemblies', () => {
    const branch = createInitialSignalPersonalBranch()

    const result = computeSignalCompetition(branch, [])

    expect(result.dominantAssemblyIds).toEqual([])
    expect(result.suppressedAssemblyIds).toEqual([])
    expect(result.inhibitionStrength).toBe(0)
  })
})
