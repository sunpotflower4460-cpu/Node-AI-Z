import type { UiAuditReport } from '../audit/uiAuditTypes'
import type { UiReviewSession, NextUiReviewSuggestion } from './uiReviewLoopTypes'

const PRIORITY_SCREENS = ['home', 'analyze', 'settings', 'onboarding']

const pickTargetReport = (
  reAuditReport?: UiAuditReport,
  initialReport?: UiAuditReport,
): UiAuditReport | undefined => reAuditReport ?? initialReport

const buildPrompt = (title: string, scope: string): string =>
  `次のUI改善を実施してください: ${title}\n対象: ${scope}\nUI Clarity Pass 方針に従い、Simple Viewではなく Research View / Developer Tools 周辺で対応してください。`

export const buildNextUiReviewSuggestion = (
  session: UiReviewSession,
  reAuditReport?: UiAuditReport,
  initialReport?: UiAuditReport,
): NextUiReviewSuggestion => {
  const report = pickTargetReport(reAuditReport, initialReport)

  if (!report) {
    return {
      priority: 'p1',
      title: 'UI Audit を再実行する',
      reason: '再監査レポートがまだありません。改善を適用した後に再監査してください。',
      recommendedScope: 'UiAuditPanel / runUiAudit',
      suggestedNextPrompt: 'UI Audit を再実行し、改善結果を確認してください。',
    }
  }

  // p0: screens with fail status
  const failedScreens = report.screenResults.filter((s) => s.status === 'fail')
  if (failedScreens.length > 0) {
    const screen = failedScreens[0]
    return {
      priority: 'p0',
      title: `${screen.screenLabel} の重大問題を修正する`,
      reason: `${screen.screenLabel} が監査でfail判定です。高優先度で対応が必要です。`,
      recommendedScope: `${screen.screenLabel} 関連コンポーネント`,
      suggestedNextPrompt: buildPrompt(`${screen.screenLabel} fail修正`, screen.screenLabel),
    }
  }

  // p0 warnings in session remaining
  const remainingWarnings = session.remainingWarnings ?? session.initialTopWarnings
  if (remainingWarnings.length > 0) {
    const firstWarning = remainingWarnings[0]
    return {
      priority: 'p0',
      title: `残存警告を解消する: ${firstWarning.split(':')[0] ?? firstWarning}`,
      reason: `以下の警告がまだ残っています: ${firstWarning}`,
      recommendedScope: firstWarning.split(':')[0]?.trim() ?? 'UI全体',
      suggestedNextPrompt: buildPrompt('残存警告の解消', firstWarning),
    }
  }

  // p1: priority screens with warning
  for (const screenId of PRIORITY_SCREENS) {
    const screen = report.screenResults.find(
      (s) => s.screenId === screenId && s.status === 'warning',
    )
    if (screen) {
      return {
        priority: 'p1',
        title: `${screen.screenLabel} の警告を改善する`,
        reason: `${screen.screenLabel} にまだ改善余地があります（score: ${screen.score}）`,
        recommendedScope: `${screen.screenLabel} 関連コンポーネント`,
        suggestedNextPrompt: buildPrompt(`${screen.screenLabel} 改善`, screen.screenLabel),
      }
    }
  }

  // p1: highest warning-count screens
  const warningScreens = report.screenResults
    .map((s) => ({
      ...s,
      warningCount: s.checks.filter((c) => c.status === 'warning' || c.status === 'fail').length,
    }))
    .filter((s) => s.warningCount > 0)
    .sort((a, b) => b.warningCount - a.warningCount)

  if (warningScreens.length > 0) {
    const screen = warningScreens[0]
    return {
      priority: 'p1',
      title: `${screen.screenLabel} の警告を整理する`,
      reason: `${screen.warningCount}件の警告が残っています`,
      recommendedScope: `${screen.screenLabel} 関連コンポーネント`,
      suggestedNextPrompt: buildPrompt(`${screen.screenLabel} 警告整理`, screen.screenLabel),
    }
  }

  // p2: minor polish
  return {
    priority: 'p2',
    title: 'コピー・スペーシングの微調整',
    reason: '大きな問題は解消されました。コピーやスペーシングのポリッシュを検討してください。',
    recommendedScope: 'UI全体 / コピー / スペーシング',
    suggestedNextPrompt: 'UIのコピーとスペーシングを微調整し、全体的な見栄えを整えてください。',
  }
}
