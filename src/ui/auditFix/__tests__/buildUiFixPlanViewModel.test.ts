import { describe, expect, it } from 'vitest'
import { buildUiFixPlanViewModel } from '../buildUiFixPlanViewModel'
import type { UiFixPlan } from '../uiAuditFixTypes'

const makePlan = (): UiFixPlan => ({
  createdAt: Date.now(),
  sourceAuditScore: 74,
  overallPriority: 'p0',
  summary: '3件の改善候補が見つかりました。2つのPR案に分割しています。優先度: P0',
  candidates: [
    {
      id: 'c1',
      sourceScreenId: 'home',
      sourceCheckId: 'check-1',
      category: 'first_screen',
      title: 'Home: 0値カード整理',
      problem: '0値カードが多い',
      recommendedFix: '折りたたみへ移動',
      priority: 'p0',
      impact: 'high',
      effort: 'small',
      affectedFilesHint: [],
      acceptanceCriteria: [],
    },
    {
      id: 'c2',
      sourceScreenId: 'analyze',
      sourceCheckId: 'check-2',
      category: 'analyze_flow',
      title: 'Analyze: 結果要約改善',
      problem: '結果が分かりにくい',
      recommendedFix: '要約カードを追加',
      priority: 'p1',
      impact: 'medium',
      effort: 'medium',
      affectedFilesHint: [],
      acceptanceCriteria: [],
    },
  ],
  prPlans: [
    {
      id: 'pr-home',
      title: 'Home初期画面の整理',
      summary: 'First screen fix',
      priority: 'p0',
      candidates: [],
      suggestedBranchName: 'fix/ui-home-first-screen',
      copilotPrompt: '# Task\n...',
    },
  ],
})

describe('buildUiFixPlanViewModel', () => {
  it('sets sourceAuditScore', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.sourceAuditScore).toBe(74)
  })

  it('sets overallPriority', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.overallPriority).toBe('p0')
  })

  it('sets candidateCount', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.candidateCount).toBe(2)
  })

  it('sets prPlanCount', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.prPlanCount).toBe(1)
  })

  it('includes only p0 candidates in topCandidates', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    for (const c of vm.topCandidates) {
      expect(c.priority).toBe('p0')
    }
  })

  it('limits topCandidates to 5', () => {
    const plan = makePlan()
    plan.candidates = Array.from({ length: 10 }, (_, i) => ({
      ...plan.candidates[0],
      id: `c${i}`,
      priority: 'p0',
    }))
    const vm = buildUiFixPlanViewModel(plan)
    expect(vm.topCandidates.length).toBeLessThanOrEqual(5)
  })

  it('sets canCopyPrompt true when copilotPrompt is non-empty', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.prPlans[0].canCopyPrompt).toBe(true)
  })

  it('includes summary', () => {
    const vm = buildUiFixPlanViewModel(makePlan())
    expect(vm.summary.length).toBeGreaterThan(0)
  })
})
