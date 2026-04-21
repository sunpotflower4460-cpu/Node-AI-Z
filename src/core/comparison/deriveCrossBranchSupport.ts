import type { PromotionCandidate } from '../coreTypes'
import type {
  BranchComparisonMatch,
  CrossBranchSupport,
} from './comparisonTypes'
import { summarizeBranchConsistency } from './computeBranchConsistencyScore'

/**
 * Derive final cross-branch support metadata from branch comparison matches.
 */
export const deriveCrossBranchSupport = (
  candidate: PromotionCandidate,
  matches: BranchComparisonMatch[],
  comparedBranchCount: number
): CrossBranchSupport => {
  const score = summarizeBranchConsistency(candidate, matches, comparedBranchCount)

  return {
    candidateId: candidate.id,
    supportCount: score.supportCount,
    comparedBranchCount: score.comparedBranchCount,
    consistencyScore: score.consistencyScore,
    matches,
    notes: score.notes,
  }
}
