import { describe, expect, it } from 'vitest'
import { homeChecks } from '../homeChecks'

describe('homeChecks', () => {
  it('has checks', () => {
    expect(homeChecks.length).toBeGreaterThan(0)
  })

  it('each check has required fields', () => {
    for (const c of homeChecks) {
      expect(c.id).toBeTruthy()
      expect(c.label).toBeTruthy()
      expect(['pass', 'warning', 'fail']).toContain(c.status)
      expect(['low', 'medium', 'high']).toContain(c.severity)
    }
  })
})
