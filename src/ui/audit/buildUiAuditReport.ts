import type { ScreenAuditResult, UiAuditReport, UiAuditStatus } from './uiAuditTypes'

const computeOverallStatus = (results: ScreenAuditResult[]): UiAuditStatus => {
  if (results.some((r) => r.status === 'fail')) return 'fail'
  if (results.some((r) => r.status === 'warning')) return 'warning'
  return 'pass'
}

const computeOverallScore = (results: ScreenAuditResult[]): number => {
  if (results.length === 0) return 100
  const total = results.reduce((sum, r) => sum + r.score, 0)
  return Math.round(total / results.length)
}

const buildTopWarnings = (results: ScreenAuditResult[]): string[] => {
  const warnings: string[] = []
  for (const r of results) {
    for (const c of r.checks) {
      if (c.status === 'warning' || c.status === 'fail') {
        warnings.push(`${r.screenLabel}: ${c.label}`)
      }
    }
  }
  return warnings.slice(0, 5)
}

const buildRecommendedNextFixes = (results: ScreenAuditResult[]): string[] => {
  const fixes: string[] = []
  for (const r of results) {
    for (const c of r.checks) {
      if (c.recommendation) {
        fixes.push(c.recommendation)
      }
    }
  }
  return [...new Set(fixes)].slice(0, 5)
}

export const buildUiAuditReport = (screenResults: ScreenAuditResult[]): UiAuditReport => ({
  createdAt: Date.now(),
  overallStatus: computeOverallStatus(screenResults),
  overallScore: computeOverallScore(screenResults),
  screenResults,
  topWarnings: buildTopWarnings(screenResults),
  recommendedNextFixes: buildRecommendedNextFixes(screenResults),
})
