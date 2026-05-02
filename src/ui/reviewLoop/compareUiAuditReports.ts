import type { UiAuditReport } from '../audit/uiAuditTypes'
import type { UiAuditComparison } from './uiReviewLoopTypes'

const buildWarningKey = (screenLabel: string, checkLabel: string): string =>
  `${screenLabel}: ${checkLabel}`

const extractWarnings = (report: UiAuditReport): Set<string> => {
  const warnings = new Set<string>()
  for (const screen of report.screenResults) {
    for (const check of screen.checks) {
      if (check.status === 'warning' || check.status === 'fail') {
        warnings.add(buildWarningKey(screen.screenLabel, check.label))
      }
    }
  }
  return warnings
}

export const compareUiAuditReports = (
  before: UiAuditReport,
  after: UiAuditReport,
): UiAuditComparison => {
  const beforeScore = before.overallScore
  const afterScore = after.overallScore
  const scoreDelta = afterScore - beforeScore

  const beforeWarnings = extractWarnings(before)
  const afterWarnings = extractWarnings(after)

  const resolvedWarnings = [...beforeWarnings].filter((w) => !afterWarnings.has(w))
  const remainingWarnings = [...beforeWarnings].filter((w) => afterWarnings.has(w))
  const newWarnings = [...afterWarnings].filter((w) => !beforeWarnings.has(w))

  const beforeScreenMap = new Map(before.screenResults.map((s) => [s.screenId, s.score]))
  const afterScreenMap = new Map(after.screenResults.map((s) => [s.screenId, s.score]))

  const improvedScreens: string[] = []
  const worsenedScreens: string[] = []

  for (const screen of after.screenResults) {
    const beforeScoreVal = beforeScreenMap.get(screen.screenId)
    if (beforeScoreVal !== undefined) {
      if (screen.score > beforeScoreVal) {
        improvedScreens.push(screen.screenLabel)
      } else if (screen.score < beforeScoreVal) {
        worsenedScreens.push(screen.screenLabel)
      }
    }
  }

  // Also check screens in before that are not in after
  for (const screen of before.screenResults) {
    if (!afterScreenMap.has(screen.screenId)) {
      worsenedScreens.push(screen.screenLabel)
    }
  }

  return {
    beforeScore,
    afterScore,
    scoreDelta,
    improvedScreens,
    worsenedScreens,
    resolvedWarnings,
    remainingWarnings,
    newWarnings,
  }
}
