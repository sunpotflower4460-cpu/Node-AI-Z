/**
 * Apply Approved Promotion - Phase M10
 * Applies an approved promotion candidate to the shared trunk.
 * Changes to trunk are conservative and small.
 */

import type { SharedTrunkState, PromotionCandidate } from '../coreTypes'
import type { PromotionApplyResult, PromotionValidationResult } from './promotionTypes'
import type { SchemaPattern } from '../../memory/types'
import type { MixedLatentNode } from '../../node/mixedNodeTypes'

/**
 * Apply an approved promotion to the shared trunk.
 * Updates trunk conservatively based on candidate type.
 */
export const applyApprovedPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  validation: PromotionValidationResult
): PromotionApplyResult => {
  const notes: string[] = []
  let trunkUpdated = false

  // Create a copy of trunk to modify
  const nextTrunk: SharedTrunkState = {
    ...trunk,
    version: trunk.version + 1,
    lastUpdatedAt: Date.now(),
    notes: [...trunk.notes],
  }

  try {
    // Apply promotion based on candidate type
    if (candidate.type === 'schema') {
      const result = applySchemaPromotion(nextTrunk, candidate, notes)
      trunkUpdated = result
    } else if (candidate.type === 'mixed_node') {
      const result = applyMixedNodePromotion(nextTrunk, candidate, notes)
      trunkUpdated = result
    } else if (candidate.type === 'bias') {
      const result = applyBiasPromotion(nextTrunk, candidate, notes)
      trunkUpdated = result
    } else if (candidate.type === 'proto_weight') {
      const result = applyProtoWeightPromotion(nextTrunk, candidate, notes)
      trunkUpdated = result
    } else {
      notes.push(`Unknown candidate type: ${candidate.type}`)
      return {
        success: false,
        candidateId: candidate.id,
        trunkUpdated: false,
        notes,
        nextTrunk: trunk, // Return original trunk on failure
      }
    }

    // Add promotion note to trunk
    if (trunkUpdated) {
      nextTrunk.notes.push(
        `Promoted ${candidate.type} from personal branch (score=${candidate.score.toFixed(2)}, risk=${validation.riskLevel})`
      )
    }

    return {
      success: true,
      candidateId: candidate.id,
      trunkUpdated,
      notes,
      nextTrunk,
    }
  } catch (error) {
    notes.push(`Error applying promotion: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      candidateId: candidate.id,
      trunkUpdated: false,
      notes,
      nextTrunk: trunk, // Return original trunk on error
    }
  }
}

/**
 * Apply a schema promotion to trunk.
 */
const applySchemaPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): boolean => {
  const schema = candidate.sourceData as SchemaPattern

  // Check if schema already exists in trunk
  const existingIndex = trunk.schemaPatterns.findIndex((t) => t.key === schema.key)

  if (existingIndex >= 0) {
    // Reinforce existing schema (conservative update)
    const existing = trunk.schemaPatterns[existingIndex]!
    trunk.schemaPatterns[existingIndex] = {
      ...existing,
      strength: Math.min(1.0, existing.strength + 0.05), // Small boost
      confidence: Math.min(1.0, existing.confidence + 0.03),
      recurrenceCount: existing.recurrenceCount + 1,
      lastReinforcedTurn: Date.now(),
    }
    notes.push(`Reinforced existing trunk schema: ${schema.key}`)
    return true
  } else {
    // Add new schema to trunk (conservative strength)
    const newTrunkSchema: SchemaPattern = {
      ...schema,
      strength: Math.min(0.6, schema.strength), // Cap initial strength
      confidence: Math.min(0.7, schema.confidence), // Cap initial confidence
    }
    trunk.schemaPatterns.push(newTrunkSchema)
    notes.push(`Added new schema to trunk: ${schema.key}`)
    return true
  }
}

/**
 * Apply a mixed node promotion to trunk.
 */
const applyMixedNodePromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): boolean => {
  const node = candidate.sourceData as MixedLatentNode

  // Check if node already exists in trunk
  const existingIndex = trunk.promotedMixedNodes.findIndex((t) => t.key === node.key)

  if (existingIndex >= 0) {
    // Reinforce existing node (conservative update)
    const existing = trunk.promotedMixedNodes[existingIndex]!
    trunk.promotedMixedNodes[existingIndex] = {
      ...existing,
      salience: Math.min(1.0, existing.salience + 0.03), // Small boost
      coherence: Math.min(1.0, existing.coherence + 0.02),
      novelty: Math.max(0.0, existing.novelty - 0.05), // Decrease novelty (more familiar)
    }
    notes.push(`Reinforced existing trunk mixed node: ${node.key}`)
    return true
  } else {
    // Add new node to trunk (conservative salience)
    const newTrunkNode: MixedLatentNode = {
      ...node,
      salience: Math.min(0.6, node.salience), // Cap initial salience
      novelty: Math.max(0.3, node.novelty), // Keep some novelty
    }
    trunk.promotedMixedNodes.push(newTrunkNode)
    notes.push(`Added new mixed node to trunk: ${node.key}`)
    return true
  }
}

/**
 * Apply a bias promotion to trunk.
 */
const applyBiasPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): boolean => {
  const biases = candidate.sourceData as Record<string, number>

  // Apply biases conservatively (small increments)
  for (const [key, value] of Object.entries(biases)) {
    const currentValue = trunk.conceptualBiases[key] || 0.0
    const delta = value * 0.1 // Only apply 10% of the bias value
    trunk.conceptualBiases[key] = currentValue + delta
    notes.push(`Updated trunk bias ${key}: ${currentValue.toFixed(3)} → ${(currentValue + delta).toFixed(3)}`)
  }

  return true
}

/**
 * Apply a proto weight promotion to trunk.
 */
const applyProtoWeightPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): boolean => {
  const weights = candidate.sourceData as Record<string, number>

  // Apply weights conservatively (small increments)
  for (const [key, value] of Object.entries(weights)) {
    const currentValue = trunk.protoMeaningBias[key] || 0.0
    const delta = value * 0.1 // Only apply 10% of the weight value
    trunk.protoMeaningBias[key] = currentValue + delta
    notes.push(`Updated trunk proto weight ${key}: ${currentValue.toFixed(3)} → ${(currentValue + delta).toFixed(3)}`)
  }

  return true
}
