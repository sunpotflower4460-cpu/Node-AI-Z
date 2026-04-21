import type { GuardianDecision } from '../guardianTypes'

export type HumanReviewSummary = {
  candidateId: string
  candidateKind: string
  confidenceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  crossBranchSupportCount: number
  comparedBranchCount: number
  consistencyScore: number
  summary: string[]
  cautionNotes: string[]
  consistencyNotes: string[]
  sourceBranchId: string
  createdAt: number
}

export type HumanReviewDecisionInput = {
  candidateId: string
  decision: GuardianDecision
  reason: string
}

export type HumanReviewRecord = {
  id: string
  candidateId: string
  actor: 'human_reviewer'
  decision: GuardianDecision
  reason: string
  createdAt: number
}
