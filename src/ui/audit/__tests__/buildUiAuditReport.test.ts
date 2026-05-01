import { describe, expect, it } from 'vitest'
import { buildUiAuditReport } from '../buildUiAuditReport'
import type { ScreenAuditResult } from '../uiAuditTypes'

const makeResult = (screenId: string, status: 'pass' | 'warning' | 'fail', score: number): ScreenAuditResult => ({
  screenId,
  screenLabel: screenId,
  status,
  score,
  checks: [],
  summary: '',
})

describe('buildUiAuditReport', () => {
  it('computes overall status as pass when all pass', () => {
    const results = [makeResult('a', 'pass', 100), makeResult('b', 'pass', 90)]
    const report = buildUiAuditReport(results)
    expect(report.overallStatus).toBe('pass')
  })

  it('computes overall status as warning when any is warning', () => {
    const results = [makeResult('a', 'pass', 100), makeResult('b', 'warning', 70)]
    const report = buildUiAuditReport(results)
    expect(report.overallStatus).toBe('warning')
  })

  it('computes overall status as fail when any is fail', () => {
    const results = [makeResult('a', 'pass', 100), makeResult('b', 'fail', 40)]
    const report = buildUiAuditReport(results)
    expect(report.overallStatus).toBe('fail')
  })

  it('computes average score', () => {
    const results = [makeResult('a', 'pass', 80), makeResult('b', 'pass', 60)]
    const report = buildUiAuditReport(results)
    expect(report.overallScore).toBe(70)
  })

  it('returns topWarnings from warning/fail checks', () => {
    const results: ScreenAuditResult[] = [{
      screenId: 'home',
      screenLabel: 'Home',
      status: 'warning',
      score: 80,
      checks: [{ id: 'c1', label: 'テスト', description: '', status: 'warning', severity: 'medium' }],
      summary: '',
    }]
    const report = buildUiAuditReport(results)
    expect(report.topWarnings).toContain('Home: テスト')
  })
})
