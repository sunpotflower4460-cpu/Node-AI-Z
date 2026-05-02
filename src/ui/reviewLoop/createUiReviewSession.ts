import type { UiAuditReport } from '../audit/uiAuditTypes'
import type { UiFixPlan } from '../auditFix/uiAuditFixTypes'
import type { UiReviewSession } from './uiReviewLoopTypes'

const generateId = (): string =>
  `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

const generateReportId = (report: UiAuditReport): string =>
  `audit_${report.createdAt.toString(36)}`

export const createUiReviewSession = (
  report: UiAuditReport,
  fixPlan?: UiFixPlan,
): UiReviewSession => {
  const now = Date.now()
  const status = fixPlan ? 'fix_plan_created' : 'audit_only'

  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    status,
    initialAuditReportId: generateReportId(report),
    initialAuditScore: report.overallScore,
    initialTopWarnings: report.topWarnings,
    fixPlanId: fixPlan ? `plan_${fixPlan.createdAt.toString(36)}` : undefined,
    fixPlanTitles: fixPlan ? fixPlan.prPlans.map((p) => p.title) : undefined,
    summary: `Audit score: ${report.overallScore}. Status: ${report.overallStatus}.`,
  }
}
