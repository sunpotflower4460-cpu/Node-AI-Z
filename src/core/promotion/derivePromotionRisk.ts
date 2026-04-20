/**
 * Derive Promotion Risk - Phase M10
 * Evaluates the risk level of promoting a candidate to shared trunk.
 */

import type { PromotionCandidate, PersonalBranchState, SharedTrunkState } from '../coreTypes'
import type { PromotionRiskLevel } from './promotionTypes'
import type { SchemaPattern } from '../../memory/types'
import type { MixedLatentNode } from '../../node/mixedNodeTypes'

export type PromotionRiskAssessment = {
  riskLevel: PromotionRiskLevel
  riskScore: number // 0.0 (low risk) to 1.0 (high risk)
  notes: string[]
}

/**
 * Derive promotion risk for a candidate.
 * Higher risk means the candidate is less stable/reliable for trunk promotion.
 */
export const derivePromotionRisk = (
  candidate: PromotionCandidate,
  _branch: PersonalBranchState,
  trunk: SharedTrunkState
): PromotionRiskAssessment => {
  const notes: string[] = []
  let riskScore = 0.5 // Start neutral

  // Factor 1: Recurrence and stability
  if (candidate.reinforcementCount < 3) {
    riskScore += 0.2
    notes.push('Low recurrence count (< 3)')
  } else if (candidate.reinforcementCount < 5) {
    riskScore += 0.1
    notes.push('Moderate recurrence count (< 5)')
  } else {
    riskScore -= 0.15
    notes.push(`Good recurrence (${candidate.reinforcementCount} times)`)
  }

  // Factor 2: Promotion score (from derivePromotionCandidates)
  if (candidate.score < 0.6) {
    riskScore += 0.15
    notes.push('Low promotion score')
  } else if (candidate.score > 0.8) {
    riskScore -= 0.2
    notes.push('High promotion score')
  }

  // Factor 3: Type-specific risk assessment
  if (candidate.type === 'schema') {
    const schemaRisk = assessSchemaRisk(candidate.sourceData as SchemaPattern, notes)
    riskScore += schemaRisk
  } else if (candidate.type === 'mixed_node') {
    const nodeRisk = assessMixedNodeRisk(candidate.sourceData as MixedLatentNode, notes)
    riskScore += nodeRisk
  }

  // Factor 4: Trunk conflict check
  const conflictRisk = assessTrunkConflict(candidate, trunk, notes)
  riskScore += conflictRisk

  // Factor 5: Supporting evidence
  const reasonCount = candidate.reasons.length
  if (reasonCount < 2) {
    riskScore += 0.1
    notes.push('Few supporting reasons')
  } else if (reasonCount >= 3) {
    riskScore -= 0.1
    notes.push('Good supporting evidence')
  }

  // Clamp risk score to [0, 1]
  riskScore = Math.max(0.0, Math.min(1.0, riskScore))

  // Determine risk level
  let riskLevel: PromotionRiskLevel
  if (riskScore < 0.35) {
    riskLevel = 'low'
  } else if (riskScore < 0.65) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'high'
  }

  return {
    riskLevel,
    riskScore,
    notes,
  }
}

/**
 * Assess risk specific to schema patterns.
 */
const assessSchemaRisk = (schema: SchemaPattern, notes: string[]): number => {
  let risk = 0.0

  // Low confidence is risky
  if (schema.confidence < 0.5) {
    risk += 0.15
    notes.push('Schema has low confidence')
  } else if (schema.confidence > 0.75) {
    risk -= 0.1
    notes.push('Schema has high confidence')
  }

  // Low strength is risky
  if (schema.strength < 0.5) {
    risk += 0.15
    notes.push('Schema has low strength')
  }

  // Very recent schemas are risky (not enough time to stabilize)
  const age = Date.now() - schema.firstSeenTurn
  if (age < 10) {
    risk += 0.1
    notes.push('Schema is very recent (< 10 turns)')
  }

  return risk
}

/**
 * Assess risk specific to mixed nodes.
 */
const assessMixedNodeRisk = (node: MixedLatentNode, notes: string[]): number => {
  let risk = 0.0

  // High novelty is risky (not yet familiar)
  if (node.novelty > 0.6) {
    risk += 0.2
    notes.push('Mixed node has high novelty')
  } else if (node.novelty < 0.3) {
    risk -= 0.1
    notes.push('Mixed node is familiar')
  }

  // Low salience is risky
  if (node.salience < 0.5) {
    risk += 0.1
    notes.push('Mixed node has low salience')
  }

  // Low coherence is risky
  if (node.coherence < 0.5) {
    risk += 0.15
    notes.push('Mixed node has low coherence')
  }

  // Single-axis nodes are less rich
  if (node.axes.length < 2) {
    risk += 0.05
    notes.push('Mixed node is single-axis')
  }

  return risk
}

/**
 * Check if candidate conflicts with existing trunk patterns.
 */
const assessTrunkConflict = (
  candidate: PromotionCandidate,
  trunk: SharedTrunkState,
  notes: string[]
): number => {
  let risk = 0.0

  if (candidate.type === 'schema') {
    const schema = candidate.sourceData as SchemaPattern
    const existingTrunkSchema = trunk.schemaPatterns.find((t) => t.key === schema.key)

    if (existingTrunkSchema) {
      // Already exists in trunk with same key - this is actually safe (reinforcement)
      risk -= 0.1
      notes.push('Reinforces existing trunk schema')
    } else {
      // Check for similar patterns that might conflict
      const similarExists = trunk.schemaPatterns.some(
        (t) => Math.abs(t.strength - schema.strength) > 0.5
      )
      if (similarExists) {
        risk += 0.1
        notes.push('May conflict with existing trunk patterns')
      }
    }
  } else if (candidate.type === 'mixed_node') {
    const node = candidate.sourceData as MixedLatentNode
    const existingTrunkNode = trunk.promotedMixedNodes.find((t) => t.key === node.key)

    if (existingTrunkNode) {
      risk -= 0.1
      notes.push('Reinforces existing trunk mixed node')
    }
  }

  return risk
}
