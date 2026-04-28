import { describe, expect, it } from 'vitest'
import {
  createSameObjectLearningScenario,
  createOverbindingStressScenario,
  createRestConsolidationScenario,
} from '../createScenarioRunner'

describe('createScenarioRunner', () => {
  it('creates same-object learning scenario', () => {
    const s = createSameObjectLearningScenario(3)
    expect(s.steps).toHaveLength(3)
    expect(s.id).toBe('same_object_learning')
  })

  it('creates overbinding stress scenario', () => {
    const s = createOverbindingStressScenario(5)
    expect(s.steps).toHaveLength(5)
  })

  it('creates rest consolidation scenario', () => {
    const s = createRestConsolidationScenario()
    const restSteps = s.steps.filter(step => step.inputType === 'rest')
    expect(restSteps.length).toBeGreaterThan(0)
  })
})
