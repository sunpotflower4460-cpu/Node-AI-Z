import { describe, expect, it } from 'vitest'
import { computeOverbindingRisk } from '../computeOverbindingRisk'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('computeOverbindingRisk', () => {
  it('returns 0 for empty branch', () => {
    const risk = computeOverbindingRisk(createInitialSignalPersonalBranch(), FIELD)
    expect(risk).toBeGreaterThanOrEqual(0)
    expect(risk).toBeLessThanOrEqual(1)
  })

  it('increases with many tentative bridges', () => {
    const riskLow = computeOverbindingRisk(createInitialSignalPersonalBranch(), FIELD)
    const fieldWithBridges = {
      ...FIELD,
      crossModalBridges: Array.from({ length: 10 }, (_, i) => ({
        id: `b${i}`, sourceAssemblyId: 'a', targetAssemblyId: 'b',
        confidence: 0.3, stage: 'tentative' as const, createdAt: Date.now(),
      })),
    }
    const riskHigh = computeOverbindingRisk(createInitialSignalPersonalBranch(), fieldWithBridges)
    expect(riskHigh).toBeGreaterThan(riskLow)
  })
})
