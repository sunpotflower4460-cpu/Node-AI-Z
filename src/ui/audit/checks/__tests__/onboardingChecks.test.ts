import { describe, expect, it } from 'vitest'
import { onboardingChecks } from '../onboardingChecks'

describe('onboardingChecks', () => {
  it('has checks', () => {
    expect(onboardingChecks.length).toBeGreaterThan(0)
  })
})
