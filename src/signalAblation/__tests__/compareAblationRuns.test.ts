import { describe, expect, it } from 'vitest'
import { compareAblationRuns } from '../compareAblationRuns'
import { createSameObjectLearningScenario } from '../../signalScenario/createScenarioRunner'
import { createDefaultAblationConfig } from '../createDefaultAblationConfig'

describe('compareAblationRuns', () => {
  it('produces a comparison with baseline and ablated results', async () => {
    const scenario = createSameObjectLearningScenario(2)
    const ablation = { ...createDefaultAblationConfig(), teacherEnabled: false }
    const { baseline, ablated, comparison } = await compareAblationRuns(scenario, ablation)
    expect(baseline.scenarioId).toBe(scenario.id)
    expect(ablated.scenarioId).toBe(scenario.id)
    expect(comparison.disabledFeatures).toContain('teacher')
    expect(typeof comparison.metricDiff.assemblyGrowthDiff).toBe('number')
  }, 60_000)
})
