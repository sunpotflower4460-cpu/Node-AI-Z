import type { UiAuditReport } from '../audit/uiAuditTypes'
import type { UiAuditComparison, UiReviewDelta } from './uiReviewLoopTypes'
import { compareUiAuditReports } from './compareUiAuditReports'

const formatScoreDeltaLabel = (delta: number): string => {
  if (delta > 0) return `+${delta} improved`
  if (delta < 0) return `${delta} worsened`
  return 'no change'
}

const buildSummary = (comparison: UiAuditComparison): string => {
  const parts: string[] = []
  parts.push(`Score: ${comparison.beforeScore} → ${comparison.afterScore} (${formatScoreDeltaLabel(comparison.scoreDelta)})`)
  if (comparison.resolvedWarnings.length > 0) {
    parts.push(`${comparison.resolvedWarnings.length}件の警告が解消されました`)
  }
  if (comparison.remainingWarnings.length > 0) {
    parts.push(`${comparison.remainingWarnings.length}件の課題が残っています`)
  }
  if (comparison.newWarnings.length > 0) {
    parts.push(`${comparison.newWarnings.length}件の新しい警告があります`)
  }
  return parts.join(' / ')
}

export const buildUiReviewDelta = (
  before: UiAuditReport,
  after: UiAuditReport,
): UiReviewDelta => {
  const comparison = compareUiAuditReports(before, after)

  const beforeScreenMap = new Map(before.screenResults.map((s) => [s.screenId, s]))
  const screenScoreDeltas = after.screenResults
    .map((s) => {
      const beforeScreen = beforeScreenMap.get(s.screenId)
      if (!beforeScreen) return null
      return {
        screenId: s.screenId,
        screenLabel: s.screenLabel,
        beforeScore: beforeScreen.score,
        afterScore: s.score,
        delta: s.score - beforeScreen.score,
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)

  return {
    scoreBefore: comparison.beforeScore,
    scoreAfter: comparison.afterScore,
    scoreDelta: comparison.scoreDelta,
    scoreDeltaLabel: formatScoreDeltaLabel(comparison.scoreDelta),
    resolvedWarnings: comparison.resolvedWarnings,
    remainingWarnings: comparison.remainingWarnings,
    newWarnings: comparison.newWarnings,
    screenScoreDeltas,
    summary: buildSummary(comparison),
  }
}
