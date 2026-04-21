import type { PromotionCandidate } from '../coreTypes'
import type {
  BranchComparisonMatch,
  ComparableBranchSummary,
} from './comparisonTypes'
import {
  getPromotionCandidateComparisonProfile,
  uniqueKeys,
} from './comparisonTypes'

const clamp = (value: number): number => Math.max(0, Math.min(1, value))

const intersect = (left: string[], right: string[]): string[] => {
  const rightSet = new Set(right)
  return uniqueKeys(left.filter((value) => rightSet.has(value)))
}

/**
 * Compare a promotion candidate against other branch summaries.
 * The current branch is excluded from the comparison set.
 */
export const comparePromotionCandidateAcrossBranches = (
  candidate: PromotionCandidate,
  currentBranchId: string,
  allSummaries: ComparableBranchSummary[]
): BranchComparisonMatch[] => {
  const profile = getPromotionCandidateComparisonProfile(candidate)

  return allSummaries
    .filter((summary) => summary.branchId !== currentBranchId)
    .map((summary) => {
      const matchedKeys: string[] = []
      const reasons: string[] = []
      let similarityScore = 0

      if (candidate.type === 'schema') {
        if (summary.schemaKeys.includes(profile.candidateKey)) {
          similarityScore += 0.65
          matchedKeys.push(profile.candidateKey)
          reasons.push('exact schema key match')
        }

        const optionMatches = intersect(
          profile.optionTendencyKeys,
          summary.optionTendencyKeys
        )
        if (optionMatches.length > 0) {
          similarityScore += Math.min(0.2, optionMatches.length * 0.1)
          matchedKeys.push(...optionMatches)
          reasons.push(`option tendency overlap (${optionMatches.length})`)
        }

        const metaphorMatches = intersect(
          profile.metaphorKeys,
          summary.metaphorKeys ?? []
        )
        if (metaphorMatches.length > 0) {
          similarityScore += Math.min(0.15, metaphorMatches.length * 0.05)
          matchedKeys.push(...metaphorMatches)
          reasons.push(`metaphor overlap (${metaphorMatches.length})`)
        }
      } else if (candidate.type === 'mixed_node') {
        if (summary.mixedPatternKeys.includes(profile.candidateKey)) {
          similarityScore += 0.6
          matchedKeys.push(profile.candidateKey)
          reasons.push('exact mixed pattern key match')
        }

        const partialMixedMatches = intersect(
          profile.mixedPatternKeys.filter((key) => key !== profile.candidateKey),
          summary.mixedPatternKeys
        )
        if (partialMixedMatches.length > 0) {
          similarityScore += Math.min(0.3, partialMixedMatches.length * 0.08)
          matchedKeys.push(...partialMixedMatches)
          reasons.push(`mixed pattern overlap (${partialMixedMatches.length})`)
        }

        const metaphorMatches = intersect(
          profile.metaphorKeys,
          summary.metaphorKeys ?? []
        )
        if (metaphorMatches.length > 0) {
          similarityScore += Math.min(0.1, metaphorMatches.length * 0.05)
          matchedKeys.push(...metaphorMatches)
          reasons.push(`tag/metaphor overlap (${metaphorMatches.length})`)
        }
      } else {
        const biasMatches = intersect(profile.optionTendencyKeys, [
          ...summary.optionTendencyKeys,
          ...summary.schemaKeys,
        ])
        if (biasMatches.length > 0) {
          similarityScore += Math.min(0.55, biasMatches.length * 0.18)
          matchedKeys.push(...biasMatches)
          reasons.push(`abstract key overlap (${biasMatches.length})`)
        }
      }

      return {
        branchId: summary.branchId,
        candidateKey: profile.candidateKey,
        matchedKeys: uniqueKeys(matchedKeys),
        similarityScore: clamp(similarityScore),
        reasons,
      }
    })
    .filter((match) => match.similarityScore >= 0.15)
    .sort((left, right) => right.similarityScore - left.similarityScore)
}
