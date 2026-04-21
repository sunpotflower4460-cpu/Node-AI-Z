import type { PromotionCandidate } from '../coreTypes'
import type { SchemaPattern } from '../../memory/types'
import type { MixedLatentNode } from '../../node/mixedNodeTypes'

export type ComparableBranchSummary = {
  branchId: string
  userIdHash?: string
  schemaKeys: string[]
  mixedPatternKeys: string[]
  optionTendencyKeys: string[]
  metaphorKeys?: string[]
  updatedAt: number
}

export type BranchComparisonMatch = {
  branchId: string
  candidateKey: string
  matchedKeys: string[]
  similarityScore: number
  reasons: string[]
}

export type CrossBranchSupport = {
  candidateId: string
  supportCount: number
  comparedBranchCount: number
  consistencyScore: number
  matches: BranchComparisonMatch[]
  notes: string[]
}

export type PromotionConsistencyRecord = {
  candidateId: string
  candidateKey: string
  supportCount: number
  comparedBranchCount: number
  consistencyScore: number
  createdAt: number
  notes: string[]
}

export type PromotionCandidateComparisonProfile = {
  candidateKey: string
  schemaKeys: string[]
  mixedPatternKeys: string[]
  optionTendencyKeys: string[]
  metaphorKeys: string[]
}

export type BranchConsistencyScoreResult = {
  comparedBranchCount: number
  supportCount: number
  exactSupportCount: number
  partialSupportCount: number
  consistencyScore: number
  notes: string[]
}

const normalizeKey = (value: string): string => value.trim().toLowerCase()

export const uniqueKeys = (values: Array<string | undefined | null>): string[] => {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? normalizeKey(value) : ''))
        .filter(Boolean)
    )
  )
}

export const tokenizeComparisonKey = (value: string): string[] => {
  return uniqueKeys(value.split(/[^a-z0-9]+/i)).filter((token) => token.length >= 3)
}

export const hashComparisonId = (value: string): string => {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `u${(hash >>> 0).toString(16)}`
}

export const getPromotionCandidateKey = (candidate: PromotionCandidate): string => {
  if ('key' in candidate.sourceData && typeof candidate.sourceData.key === 'string') {
    return normalizeKey(candidate.sourceData.key)
  }

  const recordKeys = Object.keys(candidate.sourceData ?? {})
  return uniqueKeys(recordKeys).join('|') || candidate.id
}

const getSchemaComparisonProfile = (
  schema: SchemaPattern,
  candidateKey: string
): PromotionCandidateComparisonProfile => {
  return {
    candidateKey,
    schemaKeys: [candidateKey],
    mixedPatternKeys: [],
    optionTendencyKeys: uniqueKeys(schema.optionTendencyKeys),
    metaphorKeys: uniqueKeys(schema.dominantTextureTags),
  }
}

const getMixedNodeComparisonProfile = (
  node: MixedLatentNode,
  candidateKey: string
): PromotionCandidateComparisonProfile => {
  const derivedMixedKeys = uniqueKeys([
    candidateKey,
    ...node.tags.map((tag) => `tag:${tag}`),
    ...node.axes.map((axis) => `axis:${axis}`),
    ...tokenizeComparisonKey(candidateKey).map((token) => `token:${token}`),
  ])

  return {
    candidateKey,
    schemaKeys: [],
    mixedPatternKeys: derivedMixedKeys,
    optionTendencyKeys: [],
    metaphorKeys: uniqueKeys(node.tags),
  }
}

export const getPromotionCandidateComparisonProfile = (
  candidate: PromotionCandidate
): PromotionCandidateComparisonProfile => {
  const candidateKey = getPromotionCandidateKey(candidate)

  if (candidate.type === 'schema') {
    return getSchemaComparisonProfile(candidate.sourceData as SchemaPattern, candidateKey)
  }

  if (candidate.type === 'mixed_node') {
    return getMixedNodeComparisonProfile(candidate.sourceData as MixedLatentNode, candidateKey)
  }

  const recordKeys = uniqueKeys(Object.keys(candidate.sourceData ?? {}))
  return {
    candidateKey,
    schemaKeys: [],
    mixedPatternKeys: [],
    optionTendencyKeys: recordKeys,
    metaphorKeys: [],
  }
}
