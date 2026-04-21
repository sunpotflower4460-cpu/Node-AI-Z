import type { PromotionCandidate } from '../coreTypes'
import type {
  BranchComparisonMatch,
  BranchConsistencyScoreResult,
  ComparableBranchSummary,
} from './comparisonTypes'
import { comparePromotionCandidateAcrossBranches } from './comparePromotionCandidateAcrossBranches'

const clamp = (value: number): number => Math.max(0, Math.min(1, value))

export const summarizeBranchConsistency = (
  candidate: PromotionCandidate,
  matches: BranchComparisonMatch[],
  comparedBranchCount: number
): BranchConsistencyScoreResult => {
  if (comparedBranchCount <= 0) {
    return {
      comparedBranchCount: 0,
      supportCount: 0,
      exactSupportCount: 0,
      partialSupportCount: 0,
      consistencyScore: 0,
      notes: ['no other branch summaries available yet'],
    }
  }

  const supportMatches = matches.filter((match) => match.similarityScore >= 0.45)
  const exactSupportCount = supportMatches.filter((match) =>
    match.reasons.some((reason) => reason.startsWith('exact '))
  ).length
  const partialSupportCount = Math.max(0, supportMatches.length - exactSupportCount)
  const supportRatio = supportMatches.length / comparedBranchCount
  const averageSimilarity =
    supportMatches.reduce((sum, match) => sum + match.similarityScore, 0)
    / comparedBranchCount

  const exactBonus = Math.min(0.15, exactSupportCount * 0.05)
  const recurrenceBonus = supportMatches.length >= 2 ? 0.1 : 0
  const weakPenalty = supportMatches.length === 0
    ? 0.2
    : supportMatches.length === 1 && comparedBranchCount > 1
      ? 0.05
      : 0

  const consistencyScore = clamp(
    supportRatio * 0.45 + averageSimilarity * 0.45 + exactBonus + recurrenceBonus - weakPenalty
  )

  const notes: string[] = []
  if (exactSupportCount > 0) {
    notes.push(`exact match found in ${exactSupportCount} branch${exactSupportCount === 1 ? '' : 'es'}`)
  }
  if (partialSupportCount > 0) {
    notes.push(`partial support found in ${partialSupportCount} branch${partialSupportCount === 1 ? '' : 'es'}`)
  }
  if (supportMatches.length === 0) {
    notes.push('no meaningful cross-branch support yet')
  } else if (supportMatches.length === 1) {
    notes.push('support comes from one other branch only')
  } else {
    notes.push('cross-branch recurring pattern detected')
  }
  if (candidate.type === 'mixed_node' && exactSupportCount === 0 && partialSupportCount > 0) {
    notes.push('mixed pattern support is similarity-based rather than exact')
  }

  return {
    comparedBranchCount,
    supportCount: supportMatches.length,
    exactSupportCount,
    partialSupportCount,
    consistencyScore,
    notes,
  }
}

/**
 * Compute a lightweight cross-branch consistency score for a promotion candidate.
 */
export const computeBranchConsistencyScore = (
  candidate: PromotionCandidate,
  summaries: ComparableBranchSummary[],
  currentBranchId?: string
): BranchConsistencyScoreResult => {
  const comparedSummaries = summaries.filter(
    (summary) => summary.branchId !== currentBranchId
  )
  const matches = comparePromotionCandidateAcrossBranches(
    candidate,
    currentBranchId ?? '',
    summaries
  )
  return summarizeBranchConsistency(candidate, matches, comparedSummaries.length)
}
