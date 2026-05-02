import { describe, expect, it } from 'vitest'
import { buildUiReviewDelta } from '../buildUiReviewDelta'
import type { UiAuditReport } from '../../audit/uiAuditTypes'

const makeReport = (score: number, screenScore: number, hasWarning: boolean): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: hasWarning ? 'warning' : 'pass',
  overallScore: score,
  screenResults: [
    {
      screenId: 'home',
      screenLabel: 'Home / 概要',
      status: hasWarning ? 'warning' : 'pass',
      score: screenScore,
      checks: hasWarning
        ? [{ id: 'c1', label: 'Test warning', description: '', status: 'warning', severity: 'medium' }]
        : [],
      summary: '',
    },
  ],
  topWarnings: [],
  recommendedNextFixes: [],
})

describe('buildUiReviewDelta', () => {
  it('calculates scoreDelta', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(84, 90, false))
    expect(delta.scoreDelta).toBe(12)
    expect(delta.scoreBefore).toBe(72)
    expect(delta.scoreAfter).toBe(84)
  })

  it('formats positive scoreDeltaLabel', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(84, 90, false))
    expect(delta.scoreDeltaLabel).toBe('+12 improved')
  })

  it('formats negative scoreDeltaLabel', () => {
    const delta = buildUiReviewDelta(makeReport(84, 90, false), makeReport(72, 75, true))
    expect(delta.scoreDeltaLabel).toBe('-12 worsened')
  })

  it('identifies resolved warnings', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(84, 90, false))
    expect(delta.resolvedWarnings).toContain('Home / 概要: Test warning')
  })

  it('identifies remaining warnings', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(72, 75, true))
    expect(delta.remainingWarnings).toContain('Home / 概要: Test warning')
  })

  it('calculates screen score deltas', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(84, 90, false))
    expect(delta.screenScoreDeltas).toHaveLength(1)
    expect(delta.screenScoreDeltas[0].delta).toBe(15)
  })

  it('builds summary string', () => {
    const delta = buildUiReviewDelta(makeReport(72, 75, true), makeReport(84, 90, false))
    expect(delta.summary.length).toBeGreaterThan(0)
    expect(delta.summary).toContain('72')
    expect(delta.summary).toContain('84')
  })
})
