export type UiReviewSessionStatus =
  | 'audit_only'
  | 'fix_plan_created'
  | 'fix_applied_manually'
  | 're_audited'
  | 'closed'

export type UiReviewSession = {
  id: string
  createdAt: number
  updatedAt: number

  status: UiReviewSessionStatus

  initialAuditReportId: string
  initialAuditScore: number
  initialTopWarnings: string[]

  fixPlanId?: string
  fixPlanTitles?: string[]

  appliedNotes?: string[]

  reAuditReportId?: string
  reAuditScore?: number
  scoreDelta?: number

  resolvedWarnings?: string[]
  remainingWarnings?: string[]
  newWarnings?: string[]

  screenScoreDeltas?: Array<{
    screenId: string
    screenLabel: string
    beforeScore: number
    afterScore: number
    delta: number
  }>

  summary: string
}

export type UiAuditComparison = {
  beforeScore: number
  afterScore: number
  scoreDelta: number
  improvedScreens: string[]
  worsenedScreens: string[]
  resolvedWarnings: string[]
  remainingWarnings: string[]
  newWarnings: string[]
}

export type UiReviewDelta = {
  scoreBefore: number
  scoreAfter: number
  scoreDelta: number
  scoreDeltaLabel: string
  resolvedWarnings: string[]
  remainingWarnings: string[]
  newWarnings: string[]
  screenScoreDeltas: Array<{
    screenId: string
    screenLabel: string
    beforeScore: number
    afterScore: number
    delta: number
  }>
  summary: string
}

export type NextUiReviewSuggestion = {
  priority: 'p0' | 'p1' | 'p2'
  title: string
  reason: string
  recommendedScope: string
  suggestedNextPrompt?: string
}

export type UiReviewLoopViewModel = {
  hasHistory: boolean
  latestSession?: {
    id: string
    status: string
    initialScore: number
    reAuditScore?: number
    scoreDelta?: number
    summary: string
  }
  historyCount: number
  overallTrend: 'improving' | 'flat' | 'worsening' | 'unknown'
  remainingWarnings: string[]
  nextSuggestion?: {
    priority: string
    title: string
    reason: string
    recommendedScope: string
  }
}
