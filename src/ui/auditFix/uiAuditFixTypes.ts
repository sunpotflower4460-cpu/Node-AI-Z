export type UiFixCategory =
  | 'first_screen'
  | 'analyze_flow'
  | 'tab_structure'
  | 'empty_state'
  | 'copy_clarity'
  | 'mobile_readability'
  | 'settings_clarity'
  | 'risk_wording'
  | 'mother_wording'
  | 'research_overexposure'

export type UiFixCandidate = {
  id: string
  sourceScreenId: string
  sourceCheckId: string
  category: UiFixCategory
  title: string
  problem: string
  recommendedFix: string
  priority: 'p0' | 'p1' | 'p2'
  impact: 'low' | 'medium' | 'high'
  effort: 'small' | 'medium' | 'large'
  affectedFilesHint: string[]
  acceptanceCriteria: string[]
}

export type UiFixPrPlan = {
  id: string
  title: string
  summary: string
  priority: 'p0' | 'p1' | 'p2'
  candidates: UiFixCandidate[]
  suggestedBranchName: string
  copilotPrompt: string
}

export type UiFixPlan = {
  createdAt: number
  sourceAuditScore: number
  overallPriority: 'p0' | 'p1' | 'p2'
  candidates: UiFixCandidate[]
  prPlans: UiFixPrPlan[]
  summary: string
}
