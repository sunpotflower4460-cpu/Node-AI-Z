/**
 * Apply Trunk Influence - Phase M9
 * Applies read-only influence from shared trunk to current processing.
 * Trunk provides subtle biases and pattern recognition without overriding branch.
 */

import type {
  SharedTrunkState,
  TrunkInfluenceResult,
  CoreInfluenceNote,
} from './coreTypes'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import { getTrunkSchemas, getTrunkMixedNodes, getTrunkBias } from './sharedTrunk'

/**
 * Apply trunk influence to schema patterns.
 * Trunk schemas provide subtle reinforcement to similar patterns.
 */
export const applyTrunkInfluenceToSchemas = (
  currentSchemas: SchemaPattern[],
  trunk: SharedTrunkState,
  influenceWeight: number = 0.2
): { schemas: SchemaPattern[]; notes: CoreInfluenceNote[] } => {
  const notes: CoreInfluenceNote[] = []
  const trunkSchemas = getTrunkSchemas(trunk, { minStrength: 0.4 })

  const influencedSchemas = currentSchemas.map((schema) => {
    // Find matching trunk pattern (same key or similar meanings)
    const matchingTrunk = trunkSchemas.find((t) => {
      if (t.key === schema.key) return true

      // Check for meaning overlap
      const meaningOverlap = schema.dominantProtoMeaningIds.filter((id) =>
        t.dominantProtoMeaningIds.includes(id)
      )
      return meaningOverlap.length >= 2
    })

    if (matchingTrunk) {
      // Trunk reinforces this pattern
      const strengthBoost = matchingTrunk.strength * influenceWeight * 0.1
      const confidenceBoost = matchingTrunk.confidence * influenceWeight * 0.1

      notes.push({
        origin: 'shared_trunk',
        target: 'schema',
        sourceId: matchingTrunk.id,
        delta: strengthBoost,
        reason: `Trunk pattern ${matchingTrunk.key} reinforced schema ${schema.key}`,
      })

      return {
        ...schema,
        strength: Math.min(1.0, schema.strength + strengthBoost),
        confidence: Math.min(1.0, schema.confidence + confidenceBoost),
      }
    }

    return schema
  })

  return { schemas: influencedSchemas, notes }
}

/**
 * Apply trunk influence to mixed nodes.
 * Trunk nodes provide subtle reinforcement to similar node patterns.
 */
export const applyTrunkInfluenceToMixedNodes = (
  currentNodes: MixedLatentNode[],
  trunk: SharedTrunkState,
  influenceWeight: number = 0.2
): { nodes: MixedLatentNode[]; notes: CoreInfluenceNote[] } => {
  const notes: CoreInfluenceNote[] = []
  const trunkNodes = getTrunkMixedNodes(trunk, { minSalience: 0.4 })

  const influencedNodes = currentNodes.map((node) => {
    // Find matching trunk node (same key or similar axes)
    const matchingTrunk = trunkNodes.find((t) => {
      if (t.key === node.key) return true

      // Check for axis overlap
      const axisOverlap = node.axes.filter((axis) => t.axes.includes(axis))
      return axisOverlap.length >= 2
    })

    if (matchingTrunk) {
      // Trunk reinforces this node
      const salienceBoost = matchingTrunk.salience * influenceWeight * 0.1
      const coherenceBoost = matchingTrunk.coherence * influenceWeight * 0.1

      notes.push({
        origin: 'shared_trunk',
        target: 'mixed_node',
        sourceId: matchingTrunk.id,
        delta: salienceBoost,
        reason: `Trunk node ${matchingTrunk.key} reinforced node ${node.key}`,
      })

      return {
        ...node,
        salience: Math.min(1.0, node.salience + salienceBoost),
        coherence: Math.min(1.0, node.coherence + coherenceBoost),
        novelty: node.novelty * 0.9, // Trunk match reduces novelty
      }
    }

    return node
  })

  return { nodes: influencedNodes, notes }
}

/**
 * Apply trunk conceptual biases to processing.
 * Returns bias adjustments based on trunk state.
 */
export const applyTrunkConceptualBias = (
  biasKey: string,
  trunk: SharedTrunkState,
  influenceWeight: number = 0.2
): number => {
  const trunkBias = getTrunkBias(trunk, biasKey, 0.0)
  return trunkBias * influenceWeight
}

/**
 * Main trunk influence application.
 * Applies all trunk influences to current turn state.
 */
export const applyTrunkInfluence = (
  currentSchemas: SchemaPattern[],
  currentNodes: MixedLatentNode[],
  trunk: SharedTrunkState,
  influenceWeight: number = 0.2
): TrunkInfluenceResult => {
  // Apply schema influence
  const schemaResult = applyTrunkInfluenceToSchemas(
    currentSchemas,
    trunk,
    influenceWeight
  )

  // Apply mixed node influence
  const nodeResult = applyTrunkInfluenceToMixedNodes(
    currentNodes,
    trunk,
    influenceWeight
  )

  return {
    influencedSchemas: schemaResult.schemas,
    influencedMixedNodes: nodeResult.nodes,
    notes: [...schemaResult.notes, ...nodeResult.notes],
  }
}
