import type { UiAuditCheck, UiAuditStatus, ScreenAuditResult } from './uiAuditTypes'

const SEVERITY_WEIGHT: Record<'low' | 'medium' | 'high', number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export const computeScore = (checks: UiAuditCheck[]): number => {
  if (checks.length === 0) return 100
  const totalWeight = checks.reduce((sum, c) => sum + SEVERITY_WEIGHT[c.severity], 0)
  const passedWeight = checks
    .filter((c) => c.status === 'pass')
    .reduce((sum, c) => sum + SEVERITY_WEIGHT[c.severity], 0)
  return Math.round((passedWeight / totalWeight) * 100)
}

export const computeOverallStatus = (checks: UiAuditCheck[]): UiAuditStatus => {
  if (checks.some((c) => c.status === 'fail' && c.severity === 'high')) return 'fail'
  if (checks.some((c) => c.status === 'fail')) return 'warning'
  if (checks.some((c) => c.status === 'warning')) return 'warning'
  return 'pass'
}

export const buildScreenAuditResult = (
  screenId: string,
  screenLabel: string,
  checks: UiAuditCheck[],
  summary: string,
): ScreenAuditResult => {
  const score = computeScore(checks)
  const status = computeOverallStatus(checks)
  return { screenId, screenLabel, status, score, checks, summary }
}
