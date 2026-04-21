import type { PromotionCandidate } from '../../coreTypes'
import type { PromotionValidationResult } from '../../promotion/promotionTypes'
import type { GuardianReviewRequest, GuardianReviewResult } from '../guardianTypes'
import type { HumanReviewSummary } from './humanReviewTypes'

export type BuildHumanReviewSummaryInput = {
  candidate: PromotionCandidate
  validation: PromotionValidationResult
  guardianRequest?: GuardianReviewRequest
  aiSenseiReview?: GuardianReviewResult | null
  sourceBranchId: string
}

const describeTrunkImpact = (candidate: PromotionCandidate): string => {
  switch (candidate.type) {
    case 'schema':
      return 'Would add this schema pattern to shared trunk and influence future interpretations.'
    case 'mixed_node':
      return 'Would promote this mixed latent node to trunk, shaping future field balances.'
    case 'bias':
      return 'Would update shared conceptual bias weights, changing how inputs are weighted.'
    case 'proto_weight':
      return 'Would adjust proto-meaning weights in trunk, nudging future meaning derivations.'
    default:
      return 'Would update shared trunk with this candidate.'
  }
}

/**
 * Build a concise human-facing review summary from promotion inputs.
 */
export const buildHumanReviewSummary = ({
  candidate,
  validation,
  guardianRequest,
  aiSenseiReview,
  sourceBranchId,
}: BuildHumanReviewSummaryInput): HumanReviewSummary => {
  const crossBranchSupport = candidate.crossBranchSupport ?? {
    supportCount: 0,
    comparedBranchCount: 0,
    consistencyScore: 0,
    notes: [],
  }
  const topReasons = validation.reasons.slice(0, 3)
  const summary: string[] = [
    `Kind: ${candidate.type}`,
    `Promotion score: ${candidate.score.toFixed(2)} (reinforced ${candidate.reinforcementCount}x)`,
    `Validation: ${validation.status} @ ${(validation.confidenceScore * 100).toFixed(0)}%`,
    `Risk: ${validation.riskLevel}`,
    `Cross-Branch Support Count: ${crossBranchSupport.supportCount}`,
    `Compared Branch Count: ${crossBranchSupport.comparedBranchCount}`,
    `Consistency Score: ${crossBranchSupport.consistencyScore.toFixed(2)}`,
    ...topReasons.map((reason) => `Reason: ${reason}`),
    describeTrunkImpact(candidate),
  ]

  if (guardianRequest?.summary?.length) {
    summary.push(`Guardian request: ${guardianRequest.summary.slice(0, 2).join(' / ')}`)
  }

  if (aiSenseiReview) {
    summary.push(
      `AI sensei review: ${aiSenseiReview.decision} @ ${(aiSenseiReview.confidence * 100).toFixed(0)}%`
    )
  }

  if (crossBranchSupport.notes.length > 0) {
    summary.push(
      `Cross-Branch Pattern: ${
        crossBranchSupport.supportCount >= 2
          ? 'cross-branch recurring pattern'
          : crossBranchSupport.comparedBranchCount === 0
            ? 'comparison pending'
            : 'single-branch pattern'
      }`
    )
  }

  const cautionNotes = Array.from(
    new Set([
      ...validation.cautionNotes.slice(0, 3),
      ...crossBranchSupport.notes.slice(0, 2),
      ...(aiSenseiReview?.cautionNotes?.slice(0, 2) ?? []),
      validation.riskLevel === 'high'
        ? 'High risk candidate - human review required'
        : validation.riskLevel === 'medium'
          ? 'Medium risk candidate - review recommended'
          : '',
    ].filter(Boolean))
  )

  return {
    candidateId: candidate.id,
    candidateKind: candidate.type,
    confidenceScore: validation.confidenceScore,
    riskLevel: validation.riskLevel,
    crossBranchSupportCount: crossBranchSupport.supportCount,
    comparedBranchCount: crossBranchSupport.comparedBranchCount,
    consistencyScore: crossBranchSupport.consistencyScore,
    summary,
    cautionNotes,
    consistencyNotes: [...crossBranchSupport.notes],
    sourceBranchId,
    createdAt: guardianRequest?.requestedAt ?? Date.now(),
  }
}
