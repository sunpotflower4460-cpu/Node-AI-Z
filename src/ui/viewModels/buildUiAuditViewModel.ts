import type { UiAuditReport } from '../audit/uiAuditTypes'

export type UiAuditViewModel = {
  overallStatus: 'pass' | 'warning' | 'fail'
  overallScore: number
  topWarnings: string[]
  recommendedNextFixes: string[]
  screens: Array<{
    id: string
    label: string
    score: number
    status: 'pass' | 'warning' | 'fail'
    summary: string
  }>
}

export const buildUiAuditViewModel = (report: UiAuditReport): UiAuditViewModel => ({
  overallStatus: report.overallStatus,
  overallScore: report.overallScore,
  topWarnings: report.topWarnings,
  recommendedNextFixes: report.recommendedNextFixes,
  screens: report.screenResults.map((r) => ({
    id: r.screenId,
    label: r.screenLabel,
    score: r.score,
    status: r.status,
    summary: r.summary,
  })),
})
