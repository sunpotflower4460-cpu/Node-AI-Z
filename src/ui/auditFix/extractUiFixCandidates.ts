import type { UiAuditReport, UiAuditCheck, ScreenAuditResult } from '../audit/uiAuditTypes'
import type { UiFixCandidate, UiFixCategory } from './uiAuditFixTypes'

const SCREEN_TO_CATEGORY: Record<string, UiFixCategory> = {
  home: 'first_screen',
  analyze: 'analyze_flow',
  fire: 'tab_structure',
  growth: 'tab_structure',
  teacher: 'tab_structure',
  validation: 'tab_structure',
  risk: 'risk_wording',
  history: 'tab_structure',
  mother: 'mother_wording',
  settings: 'settings_clarity',
  onboarding: 'copy_clarity',
  observe: 'tab_structure',
  experience: 'tab_structure',
}

const CHECK_LABEL_TO_CATEGORY: Array<{ pattern: RegExp; category: UiFixCategory }> = [
  { pattern: /0件|ゼロ|empty|EmptyState/i, category: 'empty_state' },
  { pattern: /モバイル|スマホ|mobile|touch|タップ/i, category: 'mobile_readability' },
  { pattern: /コピー|ラベル|表現|copy|wording/i, category: 'copy_clarity' },
  { pattern: /研究|research|開発/i, category: 'research_overexposure' },
  { pattern: /リスク|risk/i, category: 'risk_wording' },
  { pattern: /Mother|母/i, category: 'mother_wording' },
  { pattern: /設定|settings/i, category: 'settings_clarity' },
  { pattern: /タブ|tab|ナビ/i, category: 'tab_structure' },
  { pattern: /Analyze|分析|発火/i, category: 'analyze_flow' },
  { pattern: /初期|first|最初|ホーム|home/i, category: 'first_screen' },
]

const inferCategory = (screenId: string, check: UiAuditCheck): UiFixCategory => {
  for (const { pattern, category } of CHECK_LABEL_TO_CATEGORY) {
    if (pattern.test(check.label) || pattern.test(check.description)) {
      return category
    }
  }
  return SCREEN_TO_CATEGORY[screenId] ?? 'copy_clarity'
}

const inferAffectedFiles = (screenId: string, category: UiFixCategory): string[] => {
  const base: Record<string, string[]> = {
    home: ['src/ui/tabs/HomeTab.tsx', 'src/ui/overview/EmptyObservationState.tsx', 'src/ui/overview/GrowthMetricCards.tsx'],
    analyze: ['src/ui/analyze/AnalyzeFlowCard.tsx', 'src/ui/analyze/AnalyzeResultSummary.tsx'],
    settings: ['src/ui/settings/SettingsPanel.tsx', 'src/ui/settings/ResearchSettingsSection.tsx', 'src/ui/settings/DangerZone.tsx'],
    risk: ['src/ui/risk/RiskView.tsx', 'src/ui/copy/riskCopy.ts'],
    mother: ['src/ui/tabs/MotherTab.tsx', 'src/ui/copy/uiLabelMap.ts'],
    onboarding: ['src/ui/onboarding/OnboardingFlow.tsx', 'src/ui/copy/onboardingCopy.ts'],
  }
  const catFiles: Record<UiFixCategory, string[]> = {
    first_screen: ['src/ui/overview/EmptyObservationState.tsx', 'src/ui/layout/CurrentStatusBar.tsx'],
    analyze_flow: ['src/ui/analyze/AnalyzeFlowCard.tsx', 'src/ui/analyze/PostAnalyzeNextActions.tsx'],
    tab_structure: ['src/ui/navigation/PrimaryTabNav.tsx', 'src/ui/shared/TabEmptyState.tsx'],
    empty_state: ['src/ui/shared/EmptyState.tsx', 'src/ui/shared/FriendlyEmptyState.tsx'],
    copy_clarity: ['src/ui/copy/uiLabelMap.ts', 'src/ui/copy/emptyStateCopy.ts'],
    mobile_readability: ['src/ui/layout/MobileShell.tsx', 'src/ui/styles/mobileSpacing.ts'],
    settings_clarity: ['src/ui/settings/SettingsPanel.tsx', 'src/ui/settings/DangerZone.tsx'],
    risk_wording: ['src/ui/copy/riskCopy.ts', 'src/ui/risk/RiskView.tsx'],
    mother_wording: ['src/ui/copy/uiLabelMap.ts', 'src/ui/tabs/MotherTab.tsx'],
    research_overexposure: ['src/ui/settings/ResearchSettingsSection.tsx', 'src/ui/copy/researchCopy.ts'],
  }
  return [...new Set([...(base[screenId] ?? []), ...(catFiles[category] ?? [])])]
}

const buildCandidateFromCheck = (
  screen: ScreenAuditResult,
  check: UiAuditCheck,
  index: number,
): UiFixCandidate => {
  const category = inferCategory(screen.screenId, check)
  const affectedFilesHint = inferAffectedFiles(screen.screenId, category)

  return {
    id: `fix-${screen.screenId}-${check.id}-${index}`,
    sourceScreenId: screen.screenId,
    sourceCheckId: check.id,
    category,
    title: `${screen.screenLabel}: ${check.label}`,
    problem: check.description,
    recommendedFix: check.recommendation ?? `「${check.label}」を改善してください`,
    priority: 'p1',
    impact: check.severity === 'high' ? 'high' : check.severity === 'medium' ? 'medium' : 'low',
    effort: 'medium',
    affectedFilesHint,
    acceptanceCriteria: [
      `${check.label} が改善される`,
      '既存の機能が失われない',
    ],
  }
}

export const extractUiFixCandidates = (report: UiAuditReport): UiFixCandidate[] => {
  const candidates: UiFixCandidate[] = []
  let index = 0

  for (const screen of report.screenResults) {
    for (const check of screen.checks) {
      if (check.status === 'warning' || check.status === 'fail') {
        candidates.push(buildCandidateFromCheck(screen, check, index++))
      }
    }
  }

  for (const warning of report.topWarnings) {
    const alreadyCovered = candidates.some((c) => c.title.includes(warning))
    if (!alreadyCovered) {
      candidates.push({
        id: `fix-topwarn-${index++}`,
        sourceScreenId: 'global',
        sourceCheckId: 'top-warning',
        category: 'copy_clarity',
        title: warning,
        problem: warning,
        recommendedFix: `「${warning}」を改善してください`,
        priority: 'p1',
        impact: 'medium',
        effort: 'small',
        affectedFilesHint: ['src/ui/copy/uiLabelMap.ts'],
        acceptanceCriteria: [`${warning} が改善される`],
      })
    }
  }

  for (const fix of report.recommendedNextFixes) {
    const alreadyCovered = candidates.some((c) => c.recommendedFix === fix)
    if (!alreadyCovered) {
      candidates.push({
        id: `fix-recommended-${index++}`,
        sourceScreenId: 'global',
        sourceCheckId: 'recommended',
        category: 'copy_clarity',
        title: fix,
        problem: fix,
        recommendedFix: fix,
        priority: 'p2',
        impact: 'low',
        effort: 'small',
        affectedFilesHint: ['src/ui/copy/uiLabelMap.ts'],
        acceptanceCriteria: [fix],
      })
    }
  }

  return candidates
}
