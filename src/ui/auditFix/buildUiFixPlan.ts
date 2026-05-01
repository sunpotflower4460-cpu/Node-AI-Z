import type { UiAuditReport } from '../audit/uiAuditTypes'
import type { UiFixPlan } from './uiAuditFixTypes'
import { extractUiFixCandidates } from './extractUiFixCandidates'
import { prioritizeUiFixCandidates } from './prioritizeUiFixCandidates'
import { groupFixesIntoPrPlans } from './groupFixesIntoPrPlans'
import { generateCopilotUiFixPrompt } from './generateCopilotUiFixPrompt'

const computeOverallPriority = (priorities: Array<'p0' | 'p1' | 'p2'>): 'p0' | 'p1' | 'p2' => {
  if (priorities.includes('p0')) return 'p0'
  if (priorities.includes('p1')) return 'p1'
  return 'p2'
}

const buildSummary = (
  candidateCount: number,
  prCount: number,
  overallPriority: 'p0' | 'p1' | 'p2',
): string => {
  return `${candidateCount}件の改善候補が見つかりました。${prCount}つのPR案に分割しています。優先度: ${overallPriority.toUpperCase()}`
}

export const buildUiFixPlan = (report: UiAuditReport): UiFixPlan => {
  const rawCandidates = extractUiFixCandidates(report)
  const candidates = prioritizeUiFixCandidates(rawCandidates)
  const prPlans = groupFixesIntoPrPlans(candidates, generateCopilotUiFixPrompt)

  const overallPriority = computeOverallPriority(candidates.map((c) => c.priority))

  return {
    createdAt: Date.now(),
    sourceAuditScore: report.overallScore,
    overallPriority,
    candidates,
    prPlans,
    summary: buildSummary(candidates.length, prPlans.length, overallPriority),
  }
}
