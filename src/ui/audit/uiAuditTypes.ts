export type UiAuditStatus = 'pass' | 'warning' | 'fail'

export type UiAuditCheck = {
  id: string
  label: string
  description: string
  status: UiAuditStatus
  severity: 'low' | 'medium' | 'high'
  recommendation?: string
}

export type ScreenAuditResult = {
  screenId: string
  screenLabel: string
  status: UiAuditStatus
  score: number
  checks: UiAuditCheck[]
  summary: string
}

export type UiAuditReport = {
  createdAt: number
  overallStatus: UiAuditStatus
  overallScore: number
  screenResults: ScreenAuditResult[]
  topWarnings: string[]
  recommendedNextFixes: string[]
}
