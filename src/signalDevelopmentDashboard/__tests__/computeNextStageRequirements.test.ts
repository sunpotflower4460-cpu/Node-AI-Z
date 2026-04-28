import { describe, expect, it } from 'vitest'
import { computeNextStageRequirements } from '../computeNextStageRequirements'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('computeNextStageRequirements', () => {
  it('returns assembly requirement for stage 1', () => {
    const reqs = computeNextStageRequirements(createInitialSignalPersonalBranch(), 1)
    expect(reqs.length).toBeGreaterThan(0)
    expect(reqs.some(r => r.id === 'assembly_count')).toBe(true)
  })

  it('marks requirement as satisfied when met', () => {
    const branch = { ...createInitialSignalPersonalBranch(), assemblyRecords: [{ id: 'r1', assemblyId: 'a1', particleIds: [], recurrenceCount: 1, replayCount: 0, lastActivatedAt: 0, stabilityScore: 0.5, sourceHistory: [] }] }
    const reqs = computeNextStageRequirements(branch, 1)
    const assemblyReq = reqs.find(r => r.id === 'assembly_count')
    expect(assemblyReq?.satisfied).toBe(true)
  })

  it('returns empty for stage 8 (max)', () => {
    const reqs = computeNextStageRequirements(createInitialSignalPersonalBranch(), 8)
    expect(reqs).toHaveLength(0)
  })
})
