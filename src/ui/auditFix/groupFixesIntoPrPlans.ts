import type { UiFixCandidate, UiFixCategory, UiFixPrPlan } from './uiAuditFixTypes'

type PrGroup = {
  id: string
  title: string
  summary: string
  branchName: string
  categories: UiFixCategory[]
  priority: 'p0' | 'p1' | 'p2'
}

const PR_GROUPS: PrGroup[] = [
  {
    id: 'pr-home',
    title: 'Home / 初期画面の整理',
    summary: '初期画面の0値カード削減・EmptyStateの改善・主アクションの見やすさ向上',
    branchName: 'fix/ui-home-first-screen',
    categories: ['first_screen'],
    priority: 'p0',
  },
  {
    id: 'pr-analyze',
    title: 'Analyze Flowの改善',
    summary: 'Analyze前後の状態表示・結果要約・次タブ誘導の明確化',
    branchName: 'fix/ui-analyze-flow',
    categories: ['analyze_flow'],
    priority: 'p0',
  },
  {
    id: 'pr-settings',
    title: 'Settings の整理',
    summary: 'Research項目の折りたたみ・危険操作の分離・各セクションの説明追加',
    branchName: 'fix/ui-settings-clarity',
    categories: ['settings_clarity', 'research_overexposure'],
    priority: 'p0',
  },
  {
    id: 'pr-tabs',
    title: 'タブ構造 / ナビゲーションの改善',
    summary: 'タブの役割明確化・EmptyState追加・モバイルでのタブスクロール改善',
    branchName: 'fix/ui-tab-structure',
    categories: ['tab_structure', 'empty_state'],
    priority: 'p1',
  },
  {
    id: 'pr-copy',
    title: 'コピー / ラベル改善',
    summary: 'Risk・Mother・タブラベルの表現をSimple View向けに調整',
    branchName: 'fix/ui-copy-clarity',
    categories: ['copy_clarity', 'risk_wording', 'mother_wording'],
    priority: 'p1',
  },
  {
    id: 'pr-mobile',
    title: 'モバイル可読性の改善',
    summary: 'タッチターゲット・スティッキー重なり・カード密度のモバイル最適化',
    branchName: 'fix/ui-mobile-readability',
    categories: ['mobile_readability'],
    priority: 'p1',
  },
]

const highestPriority = (a: 'p0' | 'p1' | 'p2', b: 'p0' | 'p1' | 'p2'): 'p0' | 'p1' | 'p2' => {
  if (a === 'p0' || b === 'p0') return 'p0'
  if (a === 'p1' || b === 'p1') return 'p1'
  return 'p2'
}

export const groupFixesIntoPrPlans = (
  candidates: UiFixCandidate[],
  generatePrompt: (group: PrGroup, groupCandidates: UiFixCandidate[]) => string,
): UiFixPrPlan[] => {
  const plans: UiFixPrPlan[] = []

  for (const group of PR_GROUPS) {
    const groupCandidates = candidates.filter((c) => group.categories.includes(c.category))
    if (groupCandidates.length === 0) continue

    const effectivePriority = groupCandidates.reduce(
      (acc, c) => highestPriority(acc, c.priority),
      group.priority,
    )

    plans.push({
      id: group.id,
      title: group.title,
      summary: group.summary,
      priority: effectivePriority,
      candidates: groupCandidates,
      suggestedBranchName: group.branchName,
      copilotPrompt: generatePrompt(group, groupCandidates),
    })
  }

  return plans.sort((a, b) => {
    const order = { p0: 0, p1: 1, p2: 2 }
    return order[a.priority] - order[b.priority]
  })
}
