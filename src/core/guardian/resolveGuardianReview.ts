/**
 * Resolve Guardian Review - Phase M11
 * Resolves guardian review, with fallback when guardian is unavailable.
 */

import type {
  GuardianReviewRequest,
  GuardianReviewResult,
  GuardianPolicy,
} from './guardianTypes'

/**
 * Guardian Adapter
 * Interface for connecting to guardian (AI sensei or human review system).
 * For M11, this is just a placeholder - will be implemented in future phases.
 */
export type GuardianAdapter = {
  requestReview: (
    request: GuardianReviewRequest
  ) => Promise<GuardianReviewResult | null>
}

/**
 * Resolve guardian review.
 * Returns a guardian review result, or null if guardian is unavailable.
 *
 * For M11, this provides fallback behavior when guardian is not connected.
 */
export const resolveGuardianReview = async (
  request: GuardianReviewRequest,
  policy: GuardianPolicy,
  guardianAdapter?: GuardianAdapter
): Promise<GuardianReviewResult | null> => {
  const { guardianMode } = request

  // System-only mode: Return system decision immediately
  if (guardianMode === 'system_only') {
    return createSystemGuardianResult(request, policy)
  }

  // Guardian-assisted mode: Try guardian, fallback to hold
  if (guardianMode === 'guardian_assisted') {
    // If guardian adapter is available, use it
    if (guardianAdapter) {
      const result = await guardianAdapter.requestReview(request)
      if (result) {
        return result
      }
    }

    // Guardian not available: hold for review
    return createHoldForReviewResult(request)
  }

  // Human-required mode: Hold until human can review
  if (guardianMode === 'human_required') {
    // If guardian adapter is available and can handle human review, use it
    if (guardianAdapter) {
      const result = await guardianAdapter.requestReview(request)
      if (result && result.actor === 'human_reviewer') {
        return result
      }
    }

    // Human not available: hold for review
    return createHoldForReviewResult(request)
  }

  // Default: hold for review
  return createHoldForReviewResult(request)
}

/**
 * Create a system-based guardian result.
 * Used for system_only mode or low-risk auto-approve.
 */
const createSystemGuardianResult = (
  request: GuardianReviewRequest,
  policy: GuardianPolicy
): GuardianReviewResult => {
  const { validation } = request

  // Auto-approve low risk if policy allows
  if (
    validation.riskLevel === 'low' &&
    policy.autoApproveLowRisk &&
    validation.status === 'approved'
  ) {
    return {
      requestId: request.id,
      actor: 'system',
      decision: 'approve',
      confidence: validation.confidenceScore,
      reasons: ['Low risk, auto-approved by system', ...validation.reasons],
      cautionNotes: validation.cautionNotes,
      createdAt: Date.now(),
    }
  }

  // Map validation status to guardian decision
  let decision: GuardianReviewResult['decision']
  if (validation.status === 'approved') {
    decision = 'approve'
  } else if (validation.status === 'rejected') {
    decision = 'reject'
  } else {
    decision = 'quarantine'
  }

  return {
    requestId: request.id,
    actor: 'system',
    decision,
    confidence: validation.confidenceScore,
    reasons: [`System decision: ${validation.status}`, ...validation.reasons],
    cautionNotes: validation.cautionNotes,
    createdAt: Date.now(),
  }
}

/**
 * Create a hold-for-review result.
 * Used when guardian is unavailable or human review is required.
 */
const createHoldForReviewResult = (
  request: GuardianReviewRequest
): GuardianReviewResult => {
  const reasons: string[] = []

  if (request.guardianMode === 'guardian_assisted') {
    reasons.push('Guardian not available, holding for review')
  } else if (request.guardianMode === 'human_required') {
    reasons.push('Human review required, holding for review')
  }

  // Add validation info
  reasons.push(
    `Risk: ${request.validation.riskLevel}, Confidence: ${request.validation.confidenceScore.toFixed(2)}`
  )

  return {
    requestId: request.id,
    actor: 'system',
    decision: 'hold_for_review',
    confidence: 0.5,
    reasons,
    cautionNotes: request.cautionNotes,
    createdAt: Date.now(),
  }
}
