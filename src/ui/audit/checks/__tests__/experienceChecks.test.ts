import { describe, expect, it } from 'vitest'
import { experienceChecks } from '../experienceChecks'

describe('experienceChecks', () => {
  it('has checks', () => {
    expect(experienceChecks.length).toBeGreaterThan(0)
  })
})
