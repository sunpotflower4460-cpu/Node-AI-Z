import type { GuardianDecision } from '../guardianTypes'

export type AiSenseiMode = 'disabled' | 'mock' | 'remote'

export type AiSenseiReviewPayload = {
  requestId: string
  guardianMode: 'guardian_assisted' | 'human_required'
  candidateKind: string
  confidenceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string[]
  cautionNotes: string[]
}

export type AiSenseiReviewRawResponse = {
  decision?: GuardianDecision
  confidence?: number
  reasons?: string[]
  cautionNotes?: string[]
  rawText?: string
}

export type AiSenseiParsedReview = {
  success: boolean
  decision: GuardianDecision
  confidence: number
  reasons: string[]
  cautionNotes: string[]
  parseNotes: string[]
}

export type AiSenseiReviewTrace = {
  mode: AiSenseiMode
  payload: AiSenseiReviewPayload
  rawResponse: AiSenseiReviewRawResponse | null
  parsedReview: AiSenseiParsedReview | null
  fallbackNotes: string[]
}
