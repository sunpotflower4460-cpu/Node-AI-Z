import { describe, expect, it } from 'vitest'
import { extractUiFixCandidates } from '../extractUiFixCandidates'
import type { UiAuditReport } from '../../audit/uiAuditTypes'

const makeReport = (overrides?: Partial<UiAuditReport>): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: 'warning',
  overallScore: 70,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: 'warning',
      score: 75,
      checks: [
        {
          id: 'home-no-zero-flood',
          label: '0件カードが大量に並んでいない',
          description: '空状態のメトリクスカードが多すぎない',
          status: 'warning',
          severity: 'medium',
          recommendation: '0値メトリクスカードを折りたたみ表示にすることを検討してください',
        },
      ],
      summary: '',
    },
  ],
  topWarnings: [],
  recommendedNextFixes: [],
  ...overrides,
})

describe('extractUiFixCandidates', () => {
  it('extracts candidates from warning checks', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates.length).toBeGreaterThan(0)
  })

  it('creates a candidate with correct sourceScreenId', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates[0].sourceScreenId).toBe('home')
  })

  it('creates a candidate with correct sourceCheckId', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates[0].sourceCheckId).toBe('home-no-zero-flood')
  })

  it('assigns recommendedFix from check recommendation', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates[0].recommendedFix).toContain('0値メトリクスカード')
  })

  it('extracts candidates from topWarnings not already covered', () => {
    const report = makeReport({ topWarnings: ['独自のtopWarning'] })
    const candidates = extractUiFixCandidates(report)
    const topWarnCandidate = candidates.find((c) => c.title === '独自のtopWarning')
    expect(topWarnCandidate).toBeDefined()
  })

  it('does not duplicate topWarnings already covered by check candidates', () => {
    const report = makeReport({
      topWarnings: ['Home / 概要: 0件カードが大量に並んでいない'],
    })
    const candidates = extractUiFixCandidates(report)
    const topWarnCandidates = candidates.filter((c) => c.sourceCheckId === 'top-warning')
    expect(topWarnCandidates.length).toBe(0)
  })

  it('includes acceptance criteria', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates[0].acceptanceCriteria.length).toBeGreaterThan(0)
  })

  it('assigns affected files hint', () => {
    const report = makeReport()
    const candidates = extractUiFixCandidates(report)
    expect(candidates[0].affectedFilesHint.length).toBeGreaterThan(0)
  })
})
