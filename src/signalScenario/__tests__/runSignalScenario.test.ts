import { describe, expect, it } from 'vitest'
import { runSignalScenario } from '../runSignalScenario'
import { createSameObjectLearningScenario } from '../createScenarioRunner'

describe('runSignalScenario', () => {
  it('runs all steps and returns result with metrics', async () => {
    const scenario = createSameObjectLearningScenario(2)
    const result = await runSignalScenario(scenario)
    expect(result.scenarioId).toBe(scenario.id)
    expect(result.stepResults).toHaveLength(2)
    expect(typeof result.metrics.assemblyGrowth).toBe('number')
    expect(typeof result.metrics.bridgeGrowth).toBe('number')
    expect(result.endedAt).toBeGreaterThanOrEqual(result.startedAt)
  }, 30_000)
})
