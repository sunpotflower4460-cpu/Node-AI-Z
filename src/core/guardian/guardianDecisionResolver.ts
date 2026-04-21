/**
 * Guardian Decision Resolver - Phase M11
 * Resolves final promotion status based on validation and guardian review.
 */

import type { PromotionValidationResult, PromotionStatus } from '../promotion/promotionTypes'
import type {
  GuardianReviewResult,
  GuardianMode,
  GuardianDecision,
  GuardianActor,
} from './guardianTypes'

/**
 * Final promotion decision result.
 */
export type GuardianDecisionResult = {
  /** Final promotion status */
  finalStatus: PromotionStatus

  /** Guardian decision (for approval record) */
  guardianDecision: GuardianDecision

  /** Guardian actor (for approval record) */
  guardianActor: GuardianActor

  /** Reasons for this decision */
  reasons: string[]
}

/**
 * Resolve final promotion decision based on validation and guardian review.
 */
export const guardianDecisionResolver = (
  validation: PromotionValidationResult,
  guardianResult: GuardianReviewResult | null,
  guardianMode: GuardianMode
): GuardianDecisionResult => {
  // If no guardian result, fall back to validation-only decision
  if (!guardianResult) {
    return resolveWithoutGuardian(validation, guardianMode)
  }

  // System-only mode: Use validation result
  if (guardianMode === 'system_only') {
    return resolveSystemOnly(guardianResult)
  }

  // Guardian-assisted mode: Use guardian decision
  if (guardianMode === 'guardian_assisted') {
    return resolveGuardianAssisted(guardianResult)
  }

  // Human-required mode: Only approve if human reviewed
  if (guardianMode === 'human_required') {
    return resolveHumanRequired(guardianResult)
  }

  // Default: Use guardian result
  return resolveGuardianAssisted(guardianResult)
}

/**
 * Resolve without guardian result (fallback).
 */
const resolveWithoutGuardian = (
  validation: PromotionValidationResult,
  guardianMode: GuardianMode
): GuardianDecisionResult => {
  // For guardian-assisted or human-required, quarantine if no guardian result
  if (guardianMode !== 'system_only') {
    return {
      finalStatus: 'quarantined',
      guardianDecision: 'hold_for_review',
      guardianActor: 'system',
      reasons: [
        'No guardian result available',
        `Mode: ${guardianMode}`,
        ...validation.reasons,
      ],
    }
  }

  // System-only: use validation status
  return {
    finalStatus: validation.status,
    guardianDecision: mapStatusToDecision(validation.status),
    guardianActor: 'system',
    reasons: ['System-only mode', ...validation.reasons],
  }
}

/**
 * Resolve system-only mode.
 */
const resolveSystemOnly = (
  guardianResult: GuardianReviewResult
): GuardianDecisionResult => {
  const finalStatus = mapDecisionToStatus(guardianResult.decision)

  return {
    finalStatus,
    guardianDecision: guardianResult.decision,
    guardianActor: guardianResult.actor,
    reasons: guardianResult.reasons,
  }
}

/**
 * Resolve guardian-assisted mode.
 */
const resolveGuardianAssisted = (
  guardianResult: GuardianReviewResult
): GuardianDecisionResult => {
  // Map guardian decision to final status
  const finalStatus = mapDecisionToStatus(guardianResult.decision)

  return {
    finalStatus,
    guardianDecision: guardianResult.decision,
    guardianActor: guardianResult.actor,
    reasons: guardianResult.reasons,
  }
}

/**
 * Resolve human-required mode.
 * Only approve if human reviewer approved.
 */
const resolveHumanRequired = (
  guardianResult: GuardianReviewResult
): GuardianDecisionResult => {
  // Only approve if human reviewer explicitly approved
  if (
    guardianResult.actor === 'human_reviewer' &&
    guardianResult.decision === 'approve'
  ) {
    return {
      finalStatus: 'approved',
      guardianDecision: 'approve',
      guardianActor: 'human_reviewer',
      reasons: guardianResult.reasons,
    }
  }

  // Otherwise, hold or quarantine
  const finalStatus =
    guardianResult.decision === 'hold_for_review'
      ? 'quarantined'
      : mapDecisionToStatus(guardianResult.decision)

  return {
    finalStatus,
    guardianDecision: guardianResult.decision,
    guardianActor: guardianResult.actor,
    reasons: [
      ...guardianResult.reasons,
      'Human review required but not yet approved',
    ],
  }
}

/**
 * Map guardian decision to promotion status.
 */
const mapDecisionToStatus = (decision: GuardianDecision): PromotionStatus => {
  switch (decision) {
    case 'approve':
      return 'approved'
    case 'reject':
      return 'rejected'
    case 'quarantine':
    case 'hold_for_review':
      return 'quarantined'
  }
}

/**
 * Map promotion status to guardian decision.
 */
const mapStatusToDecision = (status: PromotionStatus): GuardianDecision => {
  switch (status) {
    case 'approved':
      return 'approve'
    case 'rejected':
      return 'reject'
    default:
      return 'quarantine'
  }
}
