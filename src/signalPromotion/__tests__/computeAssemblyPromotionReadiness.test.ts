import { describe, it, expect } from 'vitest'
import { computeAssemblyPromotionReadiness } from '../computeAssemblyPromotionReadiness'
import type { SignalAssemblyRecord } from '../../signalBranch/signalBranchTypes'

describe('computeAssemblyPromotionReadiness', () => {
  it('should identify ready assemblies', () => {
    const assembly: SignalAssemblyRecord = {
      id: 'rec1',
      assemblyId: 'asm1',
      particleIds: ['p1', 'p2', 'p3'],
      recurrenceCount: 10,
      replayCount: 5,
      lastActivatedAt: Date.now(),
      stabilityScore: 0.9,
      sourceHistory: ['external_stimulus', 'internal_replay'],
    }

    const readiness = computeAssemblyPromotionReadiness(assembly, false)

    expect(readiness.readinessScore).toBeGreaterThan(0.7)
    expect(readiness.noiseRisk).toBeLessThan(0.3)
    expect(readiness.recommendedAction).toBe('candidate_for_mother_export')
  })

  it('should mark suppressed assemblies as wait', () => {
    const assembly: SignalAssemblyRecord = {
      id: 'rec1',
      assemblyId: 'asm1',
      particleIds: ['p1', 'p2'],
      recurrenceCount: 10,
      replayCount: 5,
      lastActivatedAt: Date.now(),
      stabilityScore: 0.9,
      sourceHistory: ['external_stimulus'],
    }

    const readiness = computeAssemblyPromotionReadiness(assembly, true)

    expect(readiness.recommendedAction).toBe('wait')
  })

  it('should identify high noise risk', () => {
    const assembly: SignalAssemblyRecord = {
      id: 'rec1',
      assemblyId: 'asm1',
      particleIds: ['p1'],
      recurrenceCount: 1,
      replayCount: 0,
      lastActivatedAt: Date.now(),
      stabilityScore: 0.2,
      sourceHistory: ['external_stimulus'],
    }

    const readiness = computeAssemblyPromotionReadiness(assembly, false)

    expect(readiness.noiseRisk).toBeGreaterThan(0.6)
    expect(readiness.recommendedAction).toBe('wait')
  })
})
