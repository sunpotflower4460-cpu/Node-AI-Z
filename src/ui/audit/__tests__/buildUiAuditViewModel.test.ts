import { describe, expect, it } from 'vitest'
import { buildUiAuditViewModel } from '../../viewModels/buildUiAuditViewModel'
import type { UiAuditReport } from '../uiAuditTypes'

const makeReport = (): UiAuditReport => ({
  createdAt: 0,
  overallStatus: 'warning',
  overallScore: 75,
  screenResults: [
    { screenId: 'home', screenLabel: 'Home', status: 'pass', score: 90, checks: [], summary: 'ok' },
    { screenId: 'analyze', screenLabel: 'Analyze', status: 'warning', score: 60, checks: [], summary: 'has issues' },
  ],
  topWarnings: ['Home: warning'],
  recommendedNextFixes: ['Fix this'],
})

describe('buildUiAuditViewModel', () => {
  it('maps report to view model', () => {
    const vm = buildUiAuditViewModel(makeReport())
    expect(vm.overallStatus).toBe('warning')
    expect(vm.overallScore).toBe(75)
    expect(vm.screens).toHaveLength(2)
    expect(vm.screens[0].id).toBe('home')
    expect(vm.topWarnings).toContain('Home: warning')
    expect(vm.recommendedNextFixes).toContain('Fix this')
  })
})
