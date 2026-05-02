import type { UiReviewSession, UiReviewLoopViewModel, NextUiReviewSuggestion } from './uiReviewLoopTypes'

const computeOverallTrend = (
  sessions: UiReviewSession[],
): UiReviewLoopViewModel['overallTrend'] => {
  const reAudited = sessions.filter((s) => s.scoreDelta !== undefined)
  if (reAudited.length === 0) return 'unknown'
  const totalDelta = reAudited.reduce((sum, s) => sum + (s.scoreDelta ?? 0), 0)
  if (totalDelta > 0) return 'improving'
  if (totalDelta < 0) return 'worsening'
  return 'flat'
}

const collectRemainingWarnings = (sessions: UiReviewSession[]): string[] => {
  if (sessions.length === 0) return []
  const latest = sessions[0]
  return latest.remainingWarnings ?? latest.initialTopWarnings ?? []
}

export const buildUiReviewLoopViewModel = (
  sessions: UiReviewSession[],
  nextSuggestion?: NextUiReviewSuggestion,
): UiReviewLoopViewModel => {
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt)
  const latest = sorted[0]

  return {
    hasHistory: sorted.length > 0,
    latestSession: latest
      ? {
          id: latest.id,
          status: latest.status,
          initialScore: latest.initialAuditScore,
          reAuditScore: latest.reAuditScore,
          scoreDelta: latest.scoreDelta,
          summary: latest.summary,
        }
      : undefined,
    historyCount: sorted.length,
    overallTrend: computeOverallTrend(sorted),
    remainingWarnings: collectRemainingWarnings(sorted),
    nextSuggestion: nextSuggestion
      ? {
          priority: nextSuggestion.priority,
          title: nextSuggestion.title,
          reason: nextSuggestion.reason,
          recommendedScope: nextSuggestion.recommendedScope,
        }
      : undefined,
  }
}
