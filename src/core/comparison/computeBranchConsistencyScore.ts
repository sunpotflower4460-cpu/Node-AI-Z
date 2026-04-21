import type { PromotionCandidate } from '../coreTypes'
import type {
  BranchComparisonMatch,
  BranchConsistencyScoreResult,
  ComparableBranchSummary,
} from './comparisonTypes'
import { clampComparisonScore } from './comparisonTypes'
import { comparePromotionCandidateAcrossBranches } from './comparePromotionCandidateAcrossBranches'

// At ~0.45 the match has either one strong exact signal or multiple aligned weak signals.
const MIN_SUPPORT_MATCH_SCORE = 0.45
// Support ratio and average similarity carry most of the score; bonuses/penalties only nudge it.
const SUPPORT_RATIO_WEIGHT = 0.45
const AVERAGE_SIMILARITY_WEIGHT = 0.45
const EXACT_SUPPORT_BONUS_PER_BRANCH = 0.05
const MAX_EXACT_SUPPORT_BONUS = 0.15
const MULTI_BRANCH_RECURRENCE_BONUS = 0.1
const NO_SUPPORT_PENALTY = 0.2
const SINGLE_BRANCH_ONLY_PENALTY = 0.05

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

  const supportMatches = matches.filter(
    (match) => match.similarityScore >= MIN_SUPPORT_MATCH_SCORE
  )
  const exactSupportCount = supportMatches.filter((match) =>
    match.reasons.some((reason) => reason.startsWith('exact '))
  ).length
  const partialSupportCount = Math.max(0, supportMatches.length - exactSupportCount)
  const supportRatio = supportMatches.length / comparedBranchCount
  const averageSimilarity =
    supportMatches.reduce((sum, match) => sum + match.similarityScore, 0)
    / comparedBranchCount

  const exactBonus = Math.min(
    MAX_EXACT_SUPPORT_BONUS,
    exactSupportCount * EXACT_SUPPORT_BONUS_PER_BRANCH
  )
  const recurrenceBonus = supportMatches.length >= 2
    ? MULTI_BRANCH_RECURRENCE_BONUS
    : 0
  const weakPenalty = supportMatches.length === 0
    ? NO_SUPPORT_PENALTY
    : supportMatches.length === 1 && comparedBranchCount > 1
      ? SINGLE_BRANCH_ONLY_PENALTY
      : 0

  const consistencyScore = clampComparisonScore(
    supportRatio * SUPPORT_RATIO_WEIGHT
    + averageSimilarity * AVERAGE_SIMILARITY_WEIGHT
    + exactBonus
    + recurrenceBonus
    - weakPenalty
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
