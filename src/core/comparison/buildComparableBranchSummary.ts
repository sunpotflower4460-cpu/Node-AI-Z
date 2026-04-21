import type { PersonalBranchState } from '../coreTypes'
import type { ComparableBranchSummary } from './comparisonTypes'
import {
  hashComparisonId,
  tokenizeComparisonKey,
  uniqueKeys,
} from './comparisonTypes'

/**
 * Build a privacy-safe branch summary for cross-branch comparison.
 * Raw conversation text is never included here.
 */
export const buildComparableBranchSummary = (
  branch: PersonalBranchState
): ComparableBranchSummary => {
  const schemaKeys = uniqueKeys(branch.personalSchemas.map((schema) => schema.key))
  const optionTendencyKeys = uniqueKeys(
    branch.personalSchemas.flatMap((schema) => schema.optionTendencyKeys)
  )
  const metaphorKeys = uniqueKeys([
    ...branch.personalSchemas.flatMap((schema) => schema.dominantTextureTags),
    ...branch.personalMixedNodes.flatMap((node) => node.tags),
  ])
  const mixedPatternKeys = uniqueKeys(
    branch.personalMixedNodes.flatMap((node) => [
      node.key,
      ...node.tags.map((tag) => `tag:${tag}`),
      ...node.axes.map((axis) => `axis:${axis}`),
      ...tokenizeComparisonKey(node.key).map((token) => `token:${token}`),
    ])
  )

  return {
    branchId: branch.branchId,
    userIdHash: hashComparisonId(branch.branchId),
    schemaKeys,
    mixedPatternKeys,
    optionTendencyKeys,
    metaphorKeys,
    updatedAt: branch.lastUpdatedAt,
  }
}
