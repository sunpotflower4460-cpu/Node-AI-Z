import { describe, expect, it } from 'vitest'
import { ONBOARDING_STEPS } from '../onboardingCopy'

describe('ONBOARDING_STEPS', () => {
  it('has 5 steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(5)
  })

  it('first step title contains Node-AI-Z', () => {
    expect(ONBOARDING_STEPS[0].title).toContain('Node-AI-Z')
  })

  it('all steps have id, title, description', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(step.id).toBeTruthy()
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
    }
  })

  it('contains a step about 新しい信号モード', () => {
    const signalStep = ONBOARDING_STEPS.find((s) => s.description.includes('新しい信号モード'))
    expect(signalStep).toBeDefined()
  })

  it('contains a step about Analyze', () => {
    const analyzeStep = ONBOARDING_STEPS.find((s) => s.description.includes('Analyze'))
    expect(analyzeStep).toBeDefined()
  })

  it('step IDs are unique', () => {
    const ids = ONBOARDING_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
