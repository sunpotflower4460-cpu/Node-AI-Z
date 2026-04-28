import { describe, expect, it } from 'vitest'
import { buildSignalRiskSummary } from '../buildSignalRiskSummary'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('buildSignalRiskSummary', () => {
  it('returns a risk report with all fields', () => {
    const report = buildSignalRiskSummary(createInitialSignalPersonalBranch(), FIELD)
    expect(typeof report.overbindingRisk).toBe('number')
    expect(typeof report.falseBindingRisk).toBe('number')
    expect(typeof report.teacherOvertrustRisk).toBe('number')
    expect(typeof report.dreamNoiseRisk).toBe('number')
    expect(['low', 'medium', 'high']).toContain(report.riskLevel)
  })
})
