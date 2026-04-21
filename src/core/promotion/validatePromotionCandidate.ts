/**
 * Validate Promotion Candidate - Phase M10
 * Validates a promotion candidate and returns a validation result.
 */

import type { PromotionCandidate, PersonalBranchState, SharedTrunkState } from '../coreTypes'
import type { PromotionValidationResult, PromotionStatus } from './promotionTypes'
import { derivePromotionRisk } from './derivePromotionRisk'

/**
 * Validate a promotion candidate.
 * Returns a validation result with status, risk level, and reasoning.
 */
export const validatePromotionCandidate = (
  candidate: PromotionCandidate,
  branch: PersonalBranchState,
  trunk: SharedTrunkState
): PromotionValidationResult => {
  // Derive risk assessment
  const riskAssessment = derivePromotionRisk(candidate, branch, trunk)

  // Calculate confidence score based on multiple factors
  const confidenceScore = calculateValidationConfidence(
    candidate,
    riskAssessment.riskScore
  )

  // Determine initial status based on risk and confidence
  const status = deriveValidationStatus(
    candidate,
    riskAssessment.riskScore,
    confidenceScore
  )

  // Build reasons for this validation result
  const reasons = buildValidationReasons(
    candidate,
    riskAssessment,
    confidenceScore,
    status
  )

  // Build caution notes
  const cautionNotes = buildCautionNotes(candidate, riskAssessment, status)

  return {
    candidateId: candidate.id,
    status,
    riskLevel: riskAssessment.riskLevel,
    confidenceScore,
    reasons: [...reasons, ...riskAssessment.notes],
    cautionNotes,
  }
}

/**
 * Calculate overall confidence in this validation.
 */
const calculateValidationConfidence = (
  candidate: PromotionCandidate,
  riskScore: number
): number => {
  let confidence = 0.5

  // Factor 1: Promotion score (from derivePromotionCandidates)
  confidence += candidate.score * 0.3

  // Factor 2: Inverse of risk score
  confidence += (1.0 - riskScore) * 0.3

  // Factor 3: Reinforcement count
  const reinforcementFactor = Math.min(1.0, candidate.reinforcementCount / 10)
  confidence += reinforcementFactor * 0.2

  // Factor 4: Number of supporting reasons
  const reasonFactor = Math.min(1.0, candidate.reasons.length / 4)
  confidence += reasonFactor * 0.2

  const crossBranchSupport = candidate.crossBranchSupport
  if (crossBranchSupport && crossBranchSupport.comparedBranchCount > 0) {
    confidence += crossBranchSupport.consistencyScore * 0.2
    if (crossBranchSupport.supportCount >= 2) {
      confidence += 0.05
    }
  }

  return Math.max(0.0, Math.min(1.0, confidence))
}

/**
 * Determine validation status based on risk and confidence.
 */
const deriveValidationStatus = (
  candidate: PromotionCandidate,
  riskScore: number,
  confidenceScore: number
): PromotionStatus => {
  const crossBranchSupport = candidate.crossBranchSupport
  const hasComparisonContext =
    !!crossBranchSupport && crossBranchSupport.comparedBranchCount > 0

  // High risk → reject or quarantine
  if (riskScore > 0.7) {
    return 'rejected'
  }

  // Medium-high risk → quarantine
  if (riskScore > 0.5) {
    return 'quarantined'
  }

  if (
    hasComparisonContext
    && (
      crossBranchSupport.supportCount === 0
      || crossBranchSupport.consistencyScore < 0.25
    )
  ) {
    return 'quarantined'
  }

  if (
    hasComparisonContext
    && crossBranchSupport.supportCount >= 2
    && crossBranchSupport.consistencyScore >= 0.65
    && riskScore < 0.45
    && confidenceScore > 0.68
  ) {
    return 'approved'
  }

  // Low risk + high confidence → approve
  if (riskScore < 0.35 && confidenceScore > 0.7) {
    return 'approved'
  }

  // Medium risk or medium confidence → quarantine (needs more evidence)
  if (riskScore >= 0.35 || confidenceScore < 0.7) {
    return 'quarantined'
  }

  // Default: validated but not yet decided
  return 'validated'
}

/**
 * Build reasons explaining the validation result.
 */
const buildValidationReasons = (
  candidate: PromotionCandidate,
  riskAssessment: { riskLevel: string; riskScore: number },
  confidenceScore: number,
  status: PromotionStatus
): string[] => {
  const reasons: string[] = []

  // Risk-based reasons
  if (riskAssessment.riskLevel === 'low') {
    reasons.push('Low risk for trunk promotion')
  } else if (riskAssessment.riskLevel === 'high') {
    reasons.push('High risk for trunk promotion')
  } else {
    reasons.push('Medium risk for trunk promotion')
  }

  // Confidence-based reasons
  if (confidenceScore > 0.7) {
    reasons.push('High validation confidence')
  } else if (confidenceScore < 0.5) {
    reasons.push('Low validation confidence')
  }

  // Status-specific reasons
  if (status === 'approved') {
    reasons.push('Approved for trunk promotion')
  } else if (status === 'rejected') {
    reasons.push('Rejected: Not suitable for trunk')
  } else if (status === 'quarantined') {
    reasons.push('Quarantined: Needs more evidence or time')
  }

  // Recurrence-based reasons
  if (candidate.reinforcementCount >= 5) {
    reasons.push('Well-established pattern (recurred 5+ times)')
  } else if (candidate.reinforcementCount < 3) {
    reasons.push('Limited recurrence (< 3 times)')
  }

  const crossBranchSupport = candidate.crossBranchSupport
  if (crossBranchSupport && crossBranchSupport.comparedBranchCount > 0) {
    reasons.push(
      `Cross-branch support: ${crossBranchSupport.supportCount}/${crossBranchSupport.comparedBranchCount}`
    )
    reasons.push(
      `Consistency score: ${crossBranchSupport.consistencyScore.toFixed(2)}`
    )
    if (crossBranchSupport.supportCount >= 2) {
      reasons.push('Recurring across multiple branches')
    } else if (crossBranchSupport.supportCount === 0) {
      reasons.push('No cross-branch support yet')
    }
  }

  return reasons
}

/**
 * Build caution notes about potential issues.
 */
const buildCautionNotes = (
  candidate: PromotionCandidate,
  riskAssessment: { riskLevel: string; riskScore: number },
  status: PromotionStatus
): string[] => {
  const cautionNotes: string[] = []

  // Early promotion warning
  if (candidate.reinforcementCount < 5) {
    cautionNotes.push('May be too early for trunk promotion')
  }

  // High risk warning
  if (riskAssessment.riskLevel === 'high') {
    cautionNotes.push('High risk: Pattern may be unstable or too personal')
  }

  // Quarantine warning
  if (status === 'quarantined') {
    cautionNotes.push('Hold for now: More evidence or time needed')
  }

  // Low support warning
  if (candidate.reasons.length < 2) {
    cautionNotes.push('Limited supporting evidence')
  }

  const crossBranchSupport = candidate.crossBranchSupport
  if (crossBranchSupport && crossBranchSupport.comparedBranchCount > 0) {
    if (crossBranchSupport.supportCount === 0) {
      cautionNotes.push('Shared trunk may be early: no cross-branch support yet')
    } else if (crossBranchSupport.supportCount === 1) {
      cautionNotes.push('Cross-branch support is still limited to one branch')
    }

    if (crossBranchSupport.consistencyScore < 0.4) {
      cautionNotes.push('Cross-branch consistency is still weak')
    }
  }

  // Recent pattern warning
  const candidateAge = Date.now() - candidate.firstIdentifiedAt
  const hoursSinceIdentified = candidateAge / (1000 * 60 * 60)
  if (hoursSinceIdentified < 1) {
    cautionNotes.push('Very recently identified (< 1 hour)')
  }

  return cautionNotes
}
