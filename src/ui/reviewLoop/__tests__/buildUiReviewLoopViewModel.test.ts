import { describe, expect, it } from 'vitest'
import { buildUiReviewLoopViewModel } from '../buildUiReviewLoopViewModel'
import type { UiReviewSession, NextUiReviewSuggestion } from '../uiReviewLoopTypes'

const makeSession = (overrides: Partial<UiReviewSession> = {}): UiReviewSession => ({
  id: 'rev_001',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'audit_only',
  initialAuditReportId: 'audit_test',
  initialAuditScore: 72,
  initialTopWarnings: ['Home: 問題あり'],
  summary: 'Test session',
  ...overrides,
})

const makeSuggestion = (): NextUiReviewSuggestion => ({
  priority: 'p1',
  title: '改善タイトル',
  reason: '理由',
  recommendedScope: '対象範囲',
  suggestedNextPrompt: 'プロンプト',
})

describe('buildUiReviewLoopViewModel', () => {
  it('returns hasHistory false when no sessions', () => {
    const vm = buildUiReviewLoopViewModel([])
    expect(vm.hasHistory).toBe(false)
    expect(vm.historyCount).toBe(0)
    expect(vm.overallTrend).toBe('unknown')
  })

  it('returns hasHistory true with sessions', () => {
    const vm = buildUiReviewLoopViewModel([makeSession()])
    expect(vm.hasHistory).toBe(true)
    expect(vm.historyCount).toBe(1)
  })

  it('includes latestSession', () => {
    const session = makeSession({ initialAuditScore: 72 })
    const vm = buildUiReviewLoopViewModel([session])
    expect(vm.latestSession).toBeDefined()
    expect(vm.latestSession!.initialScore).toBe(72)
  })

  it('computes improving trend when scoreDelta > 0', () => {
    const session = makeSession({ scoreDelta: 10, reAuditScore: 82, status: 're_audited' })
    const vm = buildUiReviewLoopViewModel([session])
    expect(vm.overallTrend).toBe('improving')
  })

  it('computes worsening trend when scoreDelta < 0', () => {
    const session = makeSession({ scoreDelta: -5, reAuditScore: 67, status: 're_audited' })
    const vm = buildUiReviewLoopViewModel([session])
    expect(vm.overallTrend).toBe('worsening')
  })

  it('includes remainingWarnings from latest session', () => {
    const session = makeSession({ remainingWarnings: ['Home: 残る課題'] })
    const vm = buildUiReviewLoopViewModel([session])
    expect(vm.remainingWarnings).toContain('Home: 残る課題')
  })

  it('includes nextSuggestion when provided', () => {
    const vm = buildUiReviewLoopViewModel([makeSession()], makeSuggestion())
    expect(vm.nextSuggestion).toBeDefined()
    expect(vm.nextSuggestion!.title).toBe('改善タイトル')
    expect(vm.nextSuggestion!.priority).toBe('p1')
  })

  it('picks latest session by createdAt', () => {
    const older = makeSession({ id: 'rev_old', createdAt: 1000, initialAuditScore: 60 })
    const newer = makeSession({ id: 'rev_new', createdAt: 9000, initialAuditScore: 80 })
    const vm = buildUiReviewLoopViewModel([older, newer])
    expect(vm.latestSession!.initialScore).toBe(80)
  })
})
