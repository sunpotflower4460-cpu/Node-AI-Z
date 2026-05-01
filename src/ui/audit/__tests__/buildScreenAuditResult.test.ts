import { describe, expect, it } from 'vitest'
import { buildScreenAuditResult, computeScore, computeOverallStatus } from '../buildScreenAuditResult'
import type { UiAuditCheck } from '../uiAuditTypes'

const passCheck = (id: string, severity: 'low' | 'medium' | 'high' = 'medium'): UiAuditCheck => ({
  id, label: id, description: '', status: 'pass', severity,
})

const warnCheck = (id: string, severity: 'low' | 'medium' | 'high' = 'medium'): UiAuditCheck => ({
  id, label: id, description: '', status: 'warning', severity,
})

const failCheck = (id: string, severity: 'low' | 'medium' | 'high' = 'high'): UiAuditCheck => ({
  id, label: id, description: '', status: 'fail', severity,
})

describe('computeScore', () => {
  it('returns 100 for empty checks', () => {
    expect(computeScore([])).toBe(100)
  })

  it('returns 100 when all pass', () => {
    expect(computeScore([passCheck('a'), passCheck('b')])).toBe(100)
  })

  it('returns less than 100 when some fail', () => {
    expect(computeScore([passCheck('a'), failCheck('b')])).toBeLessThan(100)
  })
})

describe('computeOverallStatus', () => {
  it('returns pass when all pass', () => {
    expect(computeOverallStatus([passCheck('a')])).toBe('pass')
  })

  it('returns warning when any is warning', () => {
    expect(computeOverallStatus([passCheck('a'), warnCheck('b')])).toBe('warning')
  })

  it('returns fail when any high-severity fail', () => {
    expect(computeOverallStatus([passCheck('a'), failCheck('b', 'high')])).toBe('fail')
  })
})

describe('buildScreenAuditResult', () => {
  it('builds a ScreenAuditResult with correct fields', () => {
    const checks = [passCheck('a'), warnCheck('b')]
    const result = buildScreenAuditResult('home', 'Home', checks, 'summary text')
    expect(result.screenId).toBe('home')
    expect(result.screenLabel).toBe('Home')
    expect(result.summary).toBe('summary text')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(['pass', 'warning', 'fail']).toContain(result.status)
  })
})
