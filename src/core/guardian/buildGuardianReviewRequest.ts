/**
 * Build Guardian Review Request - Phase M11
 * Creates a guardian review request from a promotion candidate and validation.
 */

import type { PromotionCandidate } from '../coreTypes'
import type { PromotionValidationResult } from '../promotion/promotionTypes'
import type { GuardianReviewRequest, GuardianMode } from './guardianTypes'

/**
 * Build a guardian review request.
 * Creates a concise summary for guardian to review.
 */
export const buildGuardianReviewRequest = (
  candidate: PromotionCandidate,
  validation: PromotionValidationResult,
  guardianMode: GuardianMode
): GuardianReviewRequest => {
  const summary = buildSummary(candidate, validation)
  const cautionNotes = buildCautionNotes(candidate, validation)

  return {
    id: `guardian-req-${candidate.id}-${Date.now()}`,
    candidate,
    validation,
    requestedAt: Date.now(),
    guardianMode,
    summary,
    cautionNotes,
  }
}

/**
 * Build summary of key points for guardian to review.
 */
const buildSummary = (
  candidate: PromotionCandidate,
  validation: PromotionValidationResult
): string[] => {
  const summary: string[] = []

  // Candidate type and confidence
  summary.push(`Type: ${candidate.type}`)
  summary.push(`Promotion score: ${candidate.score.toFixed(2)}`)
  summary.push(`Recurrence: ${candidate.reinforcementCount} times`)

  // Validation results
  summary.push(`Risk level: ${validation.riskLevel}`)
  summary.push(`Validation confidence: ${validation.confidenceScore.toFixed(2)}`)
  summary.push(`Status: ${validation.status}`)

  // Why candidate was created
  if (candidate.reasons.length > 0) {
    summary.push(`Promotion reason: ${candidate.reasons[0]}`)
  }

  // Key validation reasons
  if (validation.reasons.length > 0) {
    summary.push(`Validation: ${validation.reasons.slice(0, 2).join(', ')}`)
  }

  return summary
}

/**
 * Build caution notes highlighting potential issues.
 */
const buildCautionNotes = (
  candidate: PromotionCandidate,
  validation: PromotionValidationResult
): string[] => {
  const cautionNotes: string[] = []

  // Add validation caution notes
  if (validation.cautionNotes.length > 0) {
    cautionNotes.push(...validation.cautionNotes)
  }

  // Add risk-based cautions
  if (validation.riskLevel === 'high') {
    cautionNotes.push('HIGH RISK: Careful review recommended')
  } else if (validation.riskLevel === 'medium') {
    cautionNotes.push('Medium risk: Consider supporting evidence')
  }

  // Add recurrence cautions
  if (candidate.reinforcementCount < 3) {
    cautionNotes.push('Low recurrence: Pattern may not be stable')
  }

  // Add confidence cautions
  if (validation.confidenceScore < 0.6) {
    cautionNotes.push('Low validation confidence')
  }

  return cautionNotes
}
