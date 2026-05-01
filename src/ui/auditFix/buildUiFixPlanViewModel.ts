import type { UiFixPlan } from './uiAuditFixTypes'

export type UiFixPlanViewModel = {
  sourceAuditScore: number
  overallPriority: 'p0' | 'p1' | 'p2'
  summary: string
  candidateCount: number
  prPlanCount: number
  topCandidates: Array<{
    id: string
    title: string
    priority: string
    category: string
  }>
  prPlans: Array<{
    id: string
    title: string
    priority: string
    summary: string
    candidateCount: number
    canCopyPrompt: boolean
  }>
}

export const buildUiFixPlanViewModel = (plan: UiFixPlan): UiFixPlanViewModel => ({
  sourceAuditScore: plan.sourceAuditScore,
  overallPriority: plan.overallPriority,
  summary: plan.summary,
  candidateCount: plan.candidates.length,
  prPlanCount: plan.prPlans.length,
  topCandidates: plan.candidates
    .filter((c) => c.priority === 'p0')
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: c.title,
      priority: c.priority,
      category: c.category,
    })),
  prPlans: plan.prPlans.map((p) => ({
    id: p.id,
    title: p.title,
    priority: p.priority,
    summary: p.summary,
    candidateCount: p.candidates.length,
    canCopyPrompt: p.copilotPrompt.length > 0,
  })),
})
