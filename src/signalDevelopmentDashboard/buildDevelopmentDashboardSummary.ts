import type { SignalDevelopmentDashboard } from './developmentDashboardTypes'

export type DevelopmentDashboardSummary = {
  currentStage: string
  stageProgress: number
  nextStage?: string
  satisfiedRequirementCount: number
  totalRequirementCount: number
  bottleneckCount: number
  recommendedNextActions: string[]
  strengths: string[]
}

export function buildDevelopmentDashboardSummary(
  dashboard: SignalDevelopmentDashboard,
): DevelopmentDashboardSummary {
  return {
    currentStage: dashboard.currentStage,
    stageProgress: dashboard.stageProgress,
    nextStage: dashboard.nextStage,
    satisfiedRequirementCount: dashboard.requirements.filter(r => r.satisfied).length,
    totalRequirementCount: dashboard.requirements.length,
    bottleneckCount: dashboard.bottlenecks.length,
    recommendedNextActions: dashboard.recommendedNextActions,
    strengths: dashboard.strengths,
  }
}
