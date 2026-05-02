import { describe, expect, it } from 'vitest'
import { compareUiAuditReports } from '../compareUiAuditReports'
import type { UiAuditReport } from '../../audit/uiAuditTypes'

const makeReport = (overrides: Partial<UiAuditReport> = {}): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: 'warning',
  overallScore: 72,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: 'warning',
      score: 75,
      checks: [
        {
          id: 'home-check-1',
          label: '0件カードが多い',
          description: '',
          status: 'warning',
          severity: 'medium',
        },
      ],
      summary: '',
    },
    {
      screenId: 'analyze',
      screenLabel: 'Analyze Flow',
      status: 'pass',
      score: 90,
      checks: [],
      summary: '',
    },
  ],
  topWarnings: [],
  recommendedNextFixes: [],
  ...overrides,
})

describe('compareUiAuditReports', () => {
  it('computes scoreDelta correctly', () => {
    const before = makeReport({ overallScore: 72 })
    const after = makeReport({ overallScore: 84 })
    const result = compareUiAuditReports(before, after)
    expect(result.scoreDelta).toBe(12)
    expect(result.beforeScore).toBe(72)
    expect(result.afterScore).toBe(84)
  })

  it('detects resolved warnings', () => {
    const before = makeReport()
    const after = makeReport({
      screenResults: [
        {
          screenId: 'home',
          screenLabel: 'Home / 概要',
          status: 'pass',
          score: 90,
          checks: [], // warning removed
          summary: '',
        },
      ],
    })
    const result = compareUiAuditReports(before, after)
    expect(result.resolvedWarnings).toContain('Home / 概要: 0件カードが多い')
  })

  it('detects remaining warnings', () => {
    const before = makeReport()
    const after = makeReport() // same warnings
    const result = compareUiAuditReports(before, after)
    expect(result.remainingWarnings).toContain('Home / 概要: 0件カードが多い')
  })

  it('detects new warnings', () => {
    const before = makeReport()
    const after = makeReport({
      screenResults: [
        {
          screenId: 'home',
          screenLabel: 'Home / 概要',
          status: 'warning',
          score: 70,
          checks: [
            {
              id: 'home-check-new',
              label: '新しい警告',
              description: '',
              status: 'warning',
              severity: 'low',
            },
          ],
          summary: '',
        },
      ],
    })
    const result = compareUiAuditReports(before, after)
    expect(result.newWarnings).toContain('Home / 概要: 新しい警告')
  })

  it('detects improved screens', () => {
    const before = makeReport()
    const after = makeReport({
      screenResults: [
        {
          screenId: 'home',
          screenLabel: 'Home / 概要',
          status: 'pass',
          score: 95, // improved from 75
          checks: [],
          summary: '',
        },
        {
          screenId: 'analyze',
          screenLabel: 'Analyze Flow',
          status: 'pass',
          score: 90,
          checks: [],
          summary: '',
        },
      ],
    })
    const result = compareUiAuditReports(before, after)
    expect(result.improvedScreens).toContain('Home / 概要')
  })
})
