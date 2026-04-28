import { describe, expect, it } from 'vitest'
import { computeDreamNoiseRisk } from '../computeDreamNoiseRisk'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('computeDreamNoiseRisk', () => {
  it('returns 0 for empty state', () => {
    expect(computeDreamNoiseRisk(createInitialSignalPersonalBranch(), FIELD)).toBe(0)
  })

  it('increases with many tentative bridges', () => {
    const fieldWithBridges = {
      ...FIELD,
      crossModalBridges: Array.from({ length: 8 }, (_, i) => ({
        id: `b${i}`, sourceAssemblyId: 'a', targetAssemblyId: 'b',
        confidence: 0.3, stage: 'tentative' as const, createdAt: Date.now(),
      })),
    }
    const risk = computeDreamNoiseRisk(createInitialSignalPersonalBranch(), fieldWithBridges)
    expect(risk).toBeGreaterThan(0)
  })
})
