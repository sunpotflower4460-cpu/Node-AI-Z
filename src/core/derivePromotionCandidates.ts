/**
 * Derive Promotion Candidates - Phase M9
 * Identifies patterns in personal branch that may be promoted to shared trunk.
 * Promotion happens when patterns show universal value, not just personal preference.
 */

import type {
  PromotionCandidate,
  PersonalBranchState,
  SharedTrunkState,
} from './coreTypes'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import { getBranchSchemas, getBranchMixedNodes } from './personalBranch'

/**
 * Derive schema promotion candidates from personal branch.
 * Schemas are candidates if they are:
 * - Strong and confident (recurrent, reliable)
 * - Not too personal/idiosyncratic
 * - Not already in trunk
 */
export const deriveSchemaPromotionCandidates = (
  branch: PersonalBranchState,
  trunk: SharedTrunkState,
  currentTurn: number
): PromotionCandidate[] => {
  const candidates: PromotionCandidate[] = []
  const branchSchemas = getBranchSchemas(branch, {
    minStrength: 0.6, // Must be well-established
    minConfidence: 0.6,
  })

  for (const schema of branchSchemas) {
    // Skip if already in trunk
    const alreadyInTrunk = trunk.schemaPatterns.some((t) => t.key === schema.key)
    if (alreadyInTrunk) continue

    // Check if schema is strong enough
    if (schema.recurrenceCount < 5) continue // Must have recurred at least 5 times

    // Calculate promotion score
    const score = calculateSchemaPromotionScore(schema, currentTurn)

    // Only include if score is high enough
    if (score > 0.6) {
      candidates.push({
        id: `promo-schema-${schema.id}`,
        type: 'schema',
        sourceData: schema,
        score,
        reasons: buildSchemaPromotionReasons(schema, score),
        firstIdentifiedAt: Date.now(),
        reinforcementCount: schema.recurrenceCount,
        approved: false,
        rejected: false,
      })
    }
  }

  return candidates
}

/**
 * Calculate promotion score for a schema pattern.
 */
const calculateSchemaPromotionScore = (
  schema: SchemaPattern,
  currentTurn: number
): number => {
  let score = 0.0

  // Factor 1: Strength and confidence
  score += (schema.strength + schema.confidence) / 2 * 0.4

  // Factor 2: Recurrence count (normalized)
  const recurrenceScore = Math.min(1.0, schema.recurrenceCount / 10)
  score += recurrenceScore * 0.3

  // Factor 3: Age (older patterns are more stable)
  const age = currentTurn - schema.firstSeenTurn
  const ageScore = Math.min(1.0, age / 50)
  score += ageScore * 0.2

  // Factor 4: Recent activity (was it reinforced recently?)
  const recency = currentTurn - schema.lastReinforcedTurn
  const recencyScore = recency < 10 ? 0.5 : 0.0
  score += recencyScore * 0.1

  return Math.min(1.0, score)
}

/**
 * Build reasons for schema promotion.
 */
const buildSchemaPromotionReasons = (
  schema: SchemaPattern,
  score: number
): string[] => {
  const reasons: string[] = []

  if (schema.strength > 0.7) {
    reasons.push(`Strong pattern (${schema.strength.toFixed(2)})`)
  }

  if (schema.confidence > 0.7) {
    reasons.push(`High confidence (${schema.confidence.toFixed(2)})`)
  }

  if (schema.recurrenceCount >= 10) {
    reasons.push(`Recurred ${schema.recurrenceCount} times`)
  }

  if (score > 0.8) {
    reasons.push('Excellent promotion candidate')
  } else if (score > 0.7) {
    reasons.push('Good promotion candidate')
  } else {
    reasons.push('Potential promotion candidate')
  }

  return reasons
}

/**
 * Derive mixed node promotion candidates from personal branch.
 * Mixed nodes are candidates if they are:
 * - Salient and coherent
 * - Low novelty (have become familiar)
 * - Not already in trunk
 */
export const deriveMixedNodePromotionCandidates = (
  branch: PersonalBranchState,
  trunk: SharedTrunkState
): PromotionCandidate[] => {
  const candidates: PromotionCandidate[] = []
  const branchNodes = getBranchMixedNodes(branch, {
    minSalience: 0.6,
    minCoherence: 0.6,
  })

  for (const node of branchNodes) {
    // Skip if already in trunk
    const alreadyInTrunk = trunk.promotedMixedNodes.some((t) => t.key === node.key)
    if (alreadyInTrunk) continue

    // Skip if still novel (not stable enough)
    if (node.novelty > 0.5) continue

    // Calculate promotion score
    const score = calculateMixedNodePromotionScore(node)

    // Only include if score is high enough
    if (score > 0.6) {
      candidates.push({
        id: `promo-node-${node.id}`,
        type: 'mixed_node',
        sourceData: node,
        score,
        reasons: buildMixedNodePromotionReasons(node, score),
        firstIdentifiedAt: Date.now(),
        reinforcementCount: 1, // Mixed nodes don't have explicit recurrence count
        approved: false,
        rejected: false,
      })
    }
  }

  return candidates
}

/**
 * Calculate promotion score for a mixed node.
 */
const calculateMixedNodePromotionScore = (node: MixedLatentNode): number => {
  let score = 0.0

  // Factor 1: Salience and coherence
  score += (node.salience + node.coherence) / 2 * 0.5

  // Factor 2: Low novelty (familiar pattern)
  const stabilityScore = 1.0 - node.novelty
  score += stabilityScore * 0.3

  // Factor 3: Multi-axis complexity (richer nodes are more valuable)
  const complexityScore = Math.min(1.0, node.axes.length / 4)
  score += complexityScore * 0.2

  return Math.min(1.0, score)
}

/**
 * Build reasons for mixed node promotion.
 */
const buildMixedNodePromotionReasons = (
  node: MixedLatentNode,
  score: number
): string[] => {
  const reasons: string[] = []

  if (node.salience > 0.7) {
    reasons.push(`High salience (${node.salience.toFixed(2)})`)
  }

  if (node.coherence > 0.7) {
    reasons.push(`High coherence (${node.coherence.toFixed(2)})`)
  }

  if (node.novelty < 0.3) {
    reasons.push('Stable, familiar pattern')
  }

  if (node.axes.length >= 3) {
    reasons.push(`Multi-axis node (${node.axes.join(', ')})`)
  }

  if (score > 0.8) {
    reasons.push('Excellent promotion candidate')
  } else if (score > 0.7) {
    reasons.push('Good promotion candidate')
  } else {
    reasons.push('Potential promotion candidate')
  }

  return reasons
}

/**
 * Main promotion candidate derivation.
 * Combines all candidate types.
 */
export const derivePromotionCandidates = (
  branch: PersonalBranchState,
  trunk: SharedTrunkState,
  currentTurn: number
): PromotionCandidate[] => {
  const schemaCandidates = deriveSchemaPromotionCandidates(branch, trunk, currentTurn)
  const nodeCandidates = deriveMixedNodePromotionCandidates(branch, trunk)

  // Combine and sort by score
  const allCandidates = [...schemaCandidates, ...nodeCandidates]
  return allCandidates.sort((a, b) => b.score - a.score)
}
