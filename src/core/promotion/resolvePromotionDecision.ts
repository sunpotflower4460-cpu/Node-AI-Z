/**
 * Resolve Promotion Decision - Phase M10
 * Resolves the final promotion decision based on validation result.
 */

import type { PromotionValidationResult, PromotionStatus, PromotionApprovalRecord } from './promotionTypes'

/**
 * Resolve promotion decision from validation result.
 * For Phase M10, this is a simple system-based decision.
 * Future phases will allow guardian/human review to override.
 */
export const resolvePromotionDecision = (
  validation: PromotionValidationResult
): {
  finalStatus: PromotionStatus
  approvalRecord: PromotionApprovalRecord
} => {
  // For now, we accept the validation status as-is
  // Future: This is where guardian/human review would be inserted
  const finalStatus = validation.status

  // Create approval record
  const approvalRecord: PromotionApprovalRecord = {
    id: `approval-${validation.candidateId}-${Date.now()}`,
    candidateId: validation.candidateId,
    decision: mapStatusToDecision(finalStatus),
    reason: buildDecisionReason(validation, finalStatus),
    createdAt: Date.now(),
    actor: 'system', // Phase M10: System automatic decision
  }

  return {
    finalStatus,
    approvalRecord,
  }
}

/**
 * Map status to decision type.
 */
const mapStatusToDecision = (
  status: PromotionStatus
): 'approve' | 'reject' | 'quarantine' => {
  if (status === 'approved') {
    return 'approve'
  } else if (status === 'rejected') {
    return 'reject'
  } else {
    // 'quarantined', 'validated', 'queued' all map to quarantine
    return 'quarantine'
  }
}

/**
 * Build reason for the decision.
 */
const buildDecisionReason = (
  validation: PromotionValidationResult,
  finalStatus: PromotionStatus
): string => {
  const parts: string[] = []

  // Start with status
  if (finalStatus === 'approved') {
    parts.push('Approved for trunk promotion:')
  } else if (finalStatus === 'rejected') {
    parts.push('Rejected from trunk promotion:')
  } else if (finalStatus === 'quarantined') {
    parts.push('Quarantined (on hold):')
  }

  // Add risk level
  parts.push(`Risk=${validation.riskLevel}`)

  // Add confidence
  parts.push(`Confidence=${validation.confidenceScore.toFixed(2)}`)

  // Add key reason if available
  if (validation.reasons.length > 0) {
    parts.push(validation.reasons[0])
  }

  return parts.join(' ')
}

/**
 * Check if a candidate should be re-evaluated later.
 * Quarantined candidates may become approvable with more evidence/time.
 */
export const shouldReEvaluateCandidate = (
  approvalRecord: PromotionApprovalRecord
): boolean => {
  // Only quarantined candidates should be re-evaluated
  if (approvalRecord.decision !== 'quarantine') {
    return false
  }

  // Re-evaluate after some time has passed (e.g., 10 turns or 5 minutes)
  const timeSinceDecision = Date.now() - approvalRecord.createdAt
  const minutesSinceDecision = timeSinceDecision / (1000 * 60)

  return minutesSinceDecision > 5
}
