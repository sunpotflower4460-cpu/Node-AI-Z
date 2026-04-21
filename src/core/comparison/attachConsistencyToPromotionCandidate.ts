import type { PromotionCandidate } from '../coreTypes'
import type {
  ComparableBranchSummary,
  PromotionConsistencyRecord,
} from './comparisonTypes'
import { comparePromotionCandidateAcrossBranches } from './comparePromotionCandidateAcrossBranches'
import { deriveCrossBranchSupport } from './deriveCrossBranchSupport'
import { getPromotionCandidateKey } from './comparisonTypes'

export type AttachConsistencyResult = {
  candidate: PromotionCandidate
  record: PromotionConsistencyRecord
}

/**
 * Attach cross-branch support metadata to a promotion candidate.
 */
export const attachConsistencyToPromotionCandidate = (
  candidate: PromotionCandidate,
  currentBranchId: string,
  allSummaries: ComparableBranchSummary[]
): AttachConsistencyResult => {
  const comparedBranchCount = allSummaries.filter(
    (summary) => summary.branchId !== currentBranchId
  ).length
  const matches = comparePromotionCandidateAcrossBranches(
    candidate,
    currentBranchId,
    allSummaries
  )
  const support = deriveCrossBranchSupport(candidate, matches, comparedBranchCount)

  return {
    candidate: {
      ...candidate,
      crossBranchSupport: {
        supportCount: support.supportCount,
        comparedBranchCount: support.comparedBranchCount,
        consistencyScore: support.consistencyScore,
        matches: [...support.matches],
        notes: [...support.notes],
      },
    },
    record: {
      candidateId: candidate.id,
      candidateKey: getPromotionCandidateKey(candidate),
      supportCount: support.supportCount,
      comparedBranchCount: support.comparedBranchCount,
      consistencyScore: support.consistencyScore,
      createdAt: Date.now(),
      notes: [...support.notes],
    },
  }
}
