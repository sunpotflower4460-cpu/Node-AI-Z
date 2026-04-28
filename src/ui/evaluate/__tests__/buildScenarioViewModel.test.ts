import { describe, expect, it } from 'vitest'
import { buildScenarioViewModel, buildScenarioRunnerViewModel } from '../buildScenarioViewModel'
import type { SignalScenario, SignalScenarioResult } from '../../../signalScenario/signalScenarioTypes'

const mockScenario: SignalScenario = {
  id: 'teacher_to_teacher_free',
  name: 'Teacher to Teacher-Free',
  description: 'teacher 補助を段階的に外した時の recall 成功率を検証する。',
  steps: [
    { id: 'step_1', inputType: 'teacher_hint', expectedEffect: 'teacher initial binding' },
    { id: 'step_2', inputType: 'text', expectedEffect: 'self recall test' },
  ],
}

const mockResult: SignalScenarioResult = {
  scenarioId: 'teacher_to_teacher_free',
  startedAt: 1000,
  endedAt: 2000,
  stepResults: [
    {
      stepId: 'step_1',
      success: true,
      activeAssemblyCount: 4,
      bridgeCount: 6,
      recallSuccessCount: 3,
      teacherDependencyAverage: 0.72,
      notes: ['teacher bridge created'],
    },
    {
      stepId: 'step_2',
      success: true,
      activeAssemblyCount: 4,
      bridgeCount: 8,
      recallSuccessCount: 5,
      teacherDependencyAverage: 0.54,
      notes: ['recall improved'],
    },
  ],
  metrics: {
    assemblyGrowth: 4,
    bridgeGrowth: 2,
    teacherDependencyDelta: -0.18,
    recallSuccessDelta: 0.23,
    overbindingRiskDelta: 0,
    promotionReadinessDelta: 0.12,
  },
  notes: ['teacher dependency dropped successfully'],
}

describe('buildScenarioViewModel', () => {
  it('builds a scenario summary view model', () => {
    const vm = buildScenarioViewModel(mockScenario, mockResult)

    expect(vm.scenarioName).toBe('Teacher to Teacher-Free')
    expect(vm.assemblyGrowth).toBe(4)
    expect(vm.bridgeGrowth).toBe(2)
    expect(vm.teacherDependencyDelta).toBe(-0.18)
    expect(vm.recallSuccessDelta).toBe(0.23)
    expect(vm.durationMs).toBe(1000)
    expect(Array.isArray(vm.metrics)).toBe(true)
    expect(vm.metrics.length).toBe(6)
  })

  it('builds steps with correct structure', () => {
    const vm = buildScenarioViewModel(mockScenario, mockResult)

    expect(vm.steps.length).toBe(2)
    expect(vm.steps[0].stepId).toBe('step_1')
    expect(typeof vm.steps[0].activeAssemblyCount).toBe('number')
    expect(Array.isArray(vm.steps[0].notes)).toBe(true)
  })

  it('metrics have goodDirection fields', () => {
    const vm = buildScenarioViewModel(mockScenario, mockResult)
    for (const metric of vm.metrics) {
      expect(['up', 'down']).toContain(metric.goodDirection)
    }
  })

  it('builds runner view model', () => {
    const runner = buildScenarioRunnerViewModel(mockScenario, null)
    expect(runner.scenarioId).toBe('teacher_to_teacher_free')
    expect(runner.lastRunAt).toBeNull()
    expect(runner.stepCount).toBe(2)
  })

  it('runner view model includes lastRunAt when provided', () => {
    const runner = buildScenarioRunnerViewModel(mockScenario, 9999)
    expect(runner.lastRunAt).toBe(9999)
  })
})
