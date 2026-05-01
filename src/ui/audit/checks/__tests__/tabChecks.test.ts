import { describe, expect, it } from 'vitest'
import { tabChecks } from '../tabChecks'

describe('tabChecks', () => {
  it('has fire checks', () => {
    expect(tabChecks.fire.length).toBeGreaterThan(0)
  })

  it('has mother checks', () => {
    expect(tabChecks.mother.length).toBeGreaterThan(0)
  })

  it('all checks have valid status', () => {
    for (const checks of Object.values(tabChecks)) {
      for (const c of checks) {
        expect(['pass', 'warning', 'fail']).toContain(c.status)
      }
    }
  })
})
