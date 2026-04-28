import { describe, expect, it } from 'vitest'
import { buildOnboardingViewModel } from '../buildOnboardingViewModel'

describe('buildOnboardingViewModel', () => {
  it('returns 5 steps', () => {
    const vm = buildOnboardingViewModel()
    expect(vm.totalSteps).toBe(5)
    expect(vm.steps).toHaveLength(5)
  })

  it('first step explains what Node-AI-Z is', () => {
    const vm = buildOnboardingViewModel()
    expect(vm.steps[0].title).toContain('Node-AI-Z')
  })

  it('all steps have id, title, description', () => {
    const vm = buildOnboardingViewModel()
    for (const step of vm.steps) {
      expect(step.id).toBeTruthy()
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
    }
  })
})
