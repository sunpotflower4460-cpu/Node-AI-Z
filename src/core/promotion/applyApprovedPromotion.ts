/**
 * Apply Approved Promotion - Phase M10
 * Applies an approved promotion candidate to the shared trunk.
 * Changes to trunk are conservative and small.
 */

import type { SharedTrunkState, PromotionCandidate } from '../coreTypes'
import type { PromotionApplyResult, PromotionValidationResult } from './promotionTypes'
import type { SchemaPattern } from '../../memory/types'
import type { MixedLatentNode } from '../../node/mixedNodeTypes'
import type { TrunkApplyRollbackMetadata } from '../trunkSafety/trunkSafetyTypes'

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
  let rollbackMetadata: TrunkApplyRollbackMetadata | undefined

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
      trunkUpdated = result.trunkUpdated
      rollbackMetadata = result.rollbackMetadata
    } else if (candidate.type === 'mixed_node') {
      const result = applyMixedNodePromotion(nextTrunk, candidate, notes)
      trunkUpdated = result.trunkUpdated
      rollbackMetadata = result.rollbackMetadata
    } else if (candidate.type === 'bias') {
      const result = applyBiasPromotion(nextTrunk, candidate, notes)
      trunkUpdated = result.trunkUpdated
      rollbackMetadata = result.rollbackMetadata
    } else if (candidate.type === 'proto_weight') {
      const result = applyProtoWeightPromotion(nextTrunk, candidate, notes)
      trunkUpdated = result.trunkUpdated
      rollbackMetadata = result.rollbackMetadata
    } else {
      notes.push(`Unknown candidate type: ${candidate.type}`)
      return {
        success: false,
        candidateId: candidate.id,
        trunkUpdated: false,
        notes,
        nextTrunk: trunk, // Return original trunk on failure
        rollbackMetadata,
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
      rollbackMetadata,
    }
  } catch (error) {
    notes.push(`Error applying promotion: ${error instanceof Error ? error.message : String(error)}`)
    return {
      success: false,
      candidateId: candidate.id,
      trunkUpdated: false,
      notes,
      nextTrunk: trunk, // Return original trunk on error
      rollbackMetadata,
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
): { trunkUpdated: boolean; rollbackMetadata: TrunkApplyRollbackMetadata } => {
  const schema = candidate.sourceData as SchemaPattern

  // Check if schema already exists in trunk
  const existingIndex = trunk.schemaPatterns.findIndex((t) => t.key === schema.key)

  if (existingIndex >= 0) {
    // Reinforce existing schema (conservative update)
    const existing = trunk.schemaPatterns[existingIndex]!
    const updatedPattern = {
      ...existing,
      strength: Math.min(1.0, existing.strength + 0.05), // Small boost
      confidence: Math.min(1.0, existing.confidence + 0.03),
      recurrenceCount: existing.recurrenceCount + 1,
      lastReinforcedTurn: Date.now(),
    }
    trunk.schemaPatterns[existingIndex] = updatedPattern
    notes.push(`Reinforced existing trunk schema: ${schema.key}`)
    return {
      trunkUpdated: true,
      rollbackMetadata: {
        schemaPatterns: [
          {
            key: schema.key,
            action: 'updated',
            previousPattern: existing,
            nextPattern: updatedPattern,
          },
        ],
      },
    }
  } else {
    // Add new schema to trunk (conservative strength)
    const newTrunkSchema: SchemaPattern = {
      ...schema,
      strength: Math.min(0.6, schema.strength), // Cap initial strength
      confidence: Math.min(0.7, schema.confidence), // Cap initial confidence
    }
    trunk.schemaPatterns.push(newTrunkSchema)
    notes.push(`Added new schema to trunk: ${schema.key}`)
    return {
      trunkUpdated: true,
      rollbackMetadata: {
        schemaPatterns: [
          {
            key: schema.key,
            action: 'added',
            nextPattern: newTrunkSchema,
          },
        ],
      },
    }
  }
}

/**
 * Apply a mixed node promotion to trunk.
 */
const applyMixedNodePromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): { trunkUpdated: boolean; rollbackMetadata: TrunkApplyRollbackMetadata } => {
  const node = candidate.sourceData as MixedLatentNode

  // Check if node already exists in trunk
  const existingIndex = trunk.promotedMixedNodes.findIndex((t) => t.key === node.key)

  if (existingIndex >= 0) {
    // Reinforce existing node (conservative update)
    const existing = trunk.promotedMixedNodes[existingIndex]!
    const updatedNode = {
      ...existing,
      salience: Math.min(1.0, existing.salience + 0.03), // Small boost
      coherence: Math.min(1.0, existing.coherence + 0.02),
      novelty: Math.max(0.0, existing.novelty - 0.05), // Decrease novelty (more familiar)
    }
    trunk.promotedMixedNodes[existingIndex] = updatedNode
    notes.push(`Reinforced existing trunk mixed node: ${node.key}`)
    return {
      trunkUpdated: true,
      rollbackMetadata: {
        mixedNodes: [
          {
            key: node.key,
            action: 'updated',
            previousNode: existing,
            nextNode: updatedNode,
          },
        ],
      },
    }
  } else {
    // Add new node to trunk (conservative salience)
    const newTrunkNode: MixedLatentNode = {
      ...node,
      salience: Math.min(0.6, node.salience), // Cap initial salience
      novelty: Math.max(0.3, node.novelty), // Keep some novelty
    }
    trunk.promotedMixedNodes.push(newTrunkNode)
    notes.push(`Added new mixed node to trunk: ${node.key}`)
    return {
      trunkUpdated: true,
      rollbackMetadata: {
        mixedNodes: [
          {
            key: node.key,
            action: 'added',
            nextNode: newTrunkNode,
          },
        ],
      },
    }
  }
}

/**
 * Apply a bias promotion to trunk.
 */
const applyBiasPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): { trunkUpdated: boolean; rollbackMetadata: TrunkApplyRollbackMetadata } => {
  const biases = candidate.sourceData as Record<string, number>
  const conceptualBiases: NonNullable<TrunkApplyRollbackMetadata['conceptualBiases']> = []

  // Apply biases conservatively (small increments)
  for (const [key, value] of Object.entries(biases)) {
    const previousValue = trunk.conceptualBiases[key]
    const currentValue = previousValue || 0.0
    const delta = value * 0.1 // Only apply 10% of the bias value
    trunk.conceptualBiases[key] = currentValue + delta
    conceptualBiases.push({
      key,
      previousValue,
      nextValue: currentValue + delta,
    })
    notes.push(`Updated trunk bias ${key}: ${currentValue.toFixed(3)} → ${(currentValue + delta).toFixed(3)}`)
  }

  return {
    trunkUpdated: true,
    rollbackMetadata: {
      conceptualBiases,
    },
  }
}

/**
 * Apply a proto weight promotion to trunk.
 */
const applyProtoWeightPromotion = (
  trunk: SharedTrunkState,
  candidate: PromotionCandidate,
  notes: string[]
): { trunkUpdated: boolean; rollbackMetadata: TrunkApplyRollbackMetadata } => {
  const weights = candidate.sourceData as Record<string, number>
  const protoMeaningBiases: NonNullable<TrunkApplyRollbackMetadata['protoMeaningBiases']> = []

  // Apply weights conservatively (small increments)
  for (const [key, value] of Object.entries(weights)) {
    const previousValue = trunk.protoMeaningBias[key]
    const currentValue = previousValue || 0.0
    const delta = value * 0.1 // Only apply 10% of the weight value
    trunk.protoMeaningBias[key] = currentValue + delta
    protoMeaningBiases.push({
      key,
      previousValue,
      nextValue: currentValue + delta,
    })
    notes.push(`Updated trunk proto weight ${key}: ${currentValue.toFixed(3)} → ${(currentValue + delta).toFixed(3)}`)
  }

  return {
    trunkUpdated: true,
    rollbackMetadata: {
      protoMeaningBiases,
    },
  }
}
