import { describe, expect, it } from 'vitest'
import { analyzeChecks } from '../analyzeChecks'

describe('analyzeChecks', () => {
  it('has checks', () => {
    expect(analyzeChecks.length).toBeGreaterThan(0)
  })

  it('each check has required fields', () => {
    for (const c of analyzeChecks) {
      expect(c.id).toBeTruthy()
      expect(['pass', 'warning', 'fail']).toContain(c.status)
    }
  })
})
