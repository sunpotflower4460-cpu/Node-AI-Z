import { describe, expect, it } from 'vitest'
import { settingsChecks } from '../settingsChecks'

describe('settingsChecks', () => {
  it('has checks', () => {
    expect(settingsChecks.length).toBeGreaterThan(0)
  })
})
