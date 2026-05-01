import { describe, expect, it } from 'vitest'
import { runUiAudit } from '../runUiAudit'

describe('runUiAudit', () => {
  it('returns a UiAuditReport', () => {
    const report = runUiAudit()
    expect(report).toBeDefined()
    expect(typeof report.createdAt).toBe('number')
    expect(report.screenResults.length).toBeGreaterThan(0)
  })

  it('overall score is between 0 and 100', () => {
    const report = runUiAudit()
    expect(report.overallScore).toBeGreaterThanOrEqual(0)
    expect(report.overallScore).toBeLessThanOrEqual(100)
  })

  it('overall status is pass, warning, or fail', () => {
    const report = runUiAudit()
    expect(['pass', 'warning', 'fail']).toContain(report.overallStatus)
  })

  it('topWarnings is an array', () => {
    const report = runUiAudit()
    expect(Array.isArray(report.topWarnings)).toBe(true)
  })

  it('recommendedNextFixes is an array', () => {
    const report = runUiAudit()
    expect(Array.isArray(report.recommendedNextFixes)).toBe(true)
  })
})
