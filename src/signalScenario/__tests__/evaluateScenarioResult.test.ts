import { describe, expect, it } from 'vitest'
import { evaluateScenarioResult } from '../evaluateScenarioResult'
import type { SignalScenarioResult } from '../signalScenarioTypes'

const makeResult = (overrides: Partial<SignalScenarioResult['metrics']> = {}): SignalScenarioResult => ({
  scenarioId: 'test',
  startedAt: 1000,
  endedAt: 2000,
  stepResults: [
    { stepId: 's0', success: true, activeAssemblyCount: 1, bridgeCount: 0, recallSuccessCount: 0, teacherDependencyAverage: 0.5, notes: [] },
    { stepId: 's1', success: true, activeAssemblyCount: 2, bridgeCount: 1, recallSuccessCount: 1, teacherDependencyAverage: 0.3, notes: [] },
  ],
  metrics: {
    assemblyGrowth: 1,
    bridgeGrowth: 1,
    teacherDependencyDelta: -0.2,
    recallSuccessDelta: 1,
    overbindingRiskDelta: 0,
    promotionReadinessDelta: 0,
    ...overrides,
  },
  notes: [],
})

describe('evaluateScenarioResult', () => {
  it('marks healthy when growth is good', () => {
    const eval_ = evaluateScenarioResult(makeResult())
    expect(eval_.overallHealthy).toBe(true)
    expect(eval_.teacherDependencyDecreased).toBe(true)
    expect(eval_.recallSuccessIncreased).toBe(true)
  })

  it('flags high overbinding risk', () => {
    const eval_ = evaluateScenarioResult(makeResult({ overbindingRiskDelta: 0.8 }))
    expect(eval_.overbindingRiskAcceptable).toBe(false)
    expect(eval_.overallHealthy).toBe(false)
  })
})
