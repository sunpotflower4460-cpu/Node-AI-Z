import type { GuardianDecision, GuardianReviewRequest } from '../guardianTypes'

export type AiSenseiFallbackReview = {
  decision: GuardianDecision
  confidence: number
  reasons: string[]
  cautionNotes: string[]
  fallbackNotes: string[]
}

export const buildAiSenseiFallbackReview = (
  request: GuardianReviewRequest,
  notes: string[]
): AiSenseiFallbackReview => {
  const fallbackNotes = notes.length > 0 ? notes : ['AI sensei review unavailable']

  const decision: GuardianDecision =
    request.guardianMode === 'human_required'
      ? 'hold_for_review'
      : request.validation.riskLevel === 'medium'
        ? 'quarantine'
        : 'hold_for_review'

  return {
    decision,
    confidence: 0.5,
    reasons: [
      'AI sensei review failed; applying safe guardian fallback',
      ...fallbackNotes,
      `Guardian mode: ${request.guardianMode}`,
    ],
    cautionNotes: Array.from(
      new Set([...request.cautionNotes, 'AI sensei fallback active'])
    ),
    fallbackNotes,
  }
}
