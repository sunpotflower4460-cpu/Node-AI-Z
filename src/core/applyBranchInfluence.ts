/**
 * Apply Branch Influence - Phase M9
 * Applies personal branch learning and biases to current processing.
 * Branch provides the primary active learning and personalization.
 */

import type {
  PersonalBranchState,
  BranchInfluenceResult,
  CoreInfluenceNote,
} from './coreTypes'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import { getBranchSchemas, getBranchMixedNodes, getBranchBias } from './personalBranch'

/**
 * Apply branch influence to schema patterns.
 * Branch schemas provide strong personalized reinforcement.
 */
export const applyBranchInfluenceToSchemas = (
  currentSchemas: SchemaPattern[],
  branch: PersonalBranchState,
  influenceWeight: number = 0.8
): { schemas: SchemaPattern[]; notes: CoreInfluenceNote[] } => {
  const notes: CoreInfluenceNote[] = []
  const branchSchemas = getBranchSchemas(branch, { minStrength: 0.2 })

  const influencedSchemas = currentSchemas.map((schema) => {
    // Find matching branch pattern
    const matchingBranch = branchSchemas.find((b) => {
      if (b.key === schema.key) return true

      // Check for meaning overlap
      const meaningOverlap = schema.dominantProtoMeaningIds.filter((id) =>
        b.dominantProtoMeaningIds.includes(id)
      )
      return meaningOverlap.length >= 2
    })

    if (matchingBranch) {
      // Branch strongly reinforces this pattern
      const strengthBoost = matchingBranch.strength * influenceWeight * 0.15
      const confidenceBoost = matchingBranch.confidence * influenceWeight * 0.15

      notes.push({
        origin: 'personal_branch',
        target: 'schema',
        sourceId: matchingBranch.id,
        delta: strengthBoost,
        reason: `Branch pattern ${matchingBranch.key} reinforced schema ${schema.key}`,
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
 * Apply branch influence to mixed nodes.
 * Branch nodes provide strong personalized reinforcement.
 */
export const applyBranchInfluenceToMixedNodes = (
  currentNodes: MixedLatentNode[],
  branch: PersonalBranchState,
  influenceWeight: number = 0.8
): { nodes: MixedLatentNode[]; notes: CoreInfluenceNote[] } => {
  const notes: CoreInfluenceNote[] = []
  const branchNodes = getBranchMixedNodes(branch, { minSalience: 0.2 })

  const influencedNodes = currentNodes.map((node) => {
    // Find matching branch node
    const matchingBranch = branchNodes.find((b) => {
      if (b.key === node.key) return true

      // Check for axis overlap
      const axisOverlap = node.axes.filter((axis) => b.axes.includes(axis))
      return axisOverlap.length >= 2
    })

    if (matchingBranch) {
      // Branch strongly reinforces this node
      const salienceBoost = matchingBranch.salience * influenceWeight * 0.15
      const coherenceBoost = matchingBranch.coherence * influenceWeight * 0.15

      notes.push({
        origin: 'personal_branch',
        target: 'mixed_node',
        sourceId: matchingBranch.id,
        delta: salienceBoost,
        reason: `Branch node ${matchingBranch.key} reinforced node ${node.key}`,
      })

      return {
        ...node,
        salience: Math.min(1.0, node.salience + salienceBoost),
        coherence: Math.min(1.0, node.coherence + coherenceBoost),
        novelty: node.novelty * 0.8, // Branch match reduces novelty slightly
      }
    }

    return node
  })

  return { nodes: influencedNodes, notes }
}

/**
 * Apply branch personal biases to processing.
 * Returns bias adjustments based on branch state.
 */
export const applyBranchPersonalBias = (
  biasKey: string,
  branch: PersonalBranchState,
  influenceWeight: number = 0.8
): number => {
  const branchBias = getBranchBias(branch, biasKey, 0.0)
  return branchBias * influenceWeight
}

/**
 * Main branch influence application.
 * Applies all branch influences to current turn state.
 */
export const applyBranchInfluence = (
  currentSchemas: SchemaPattern[],
  currentNodes: MixedLatentNode[],
  branch: PersonalBranchState,
  influenceWeight: number = 0.8
): BranchInfluenceResult => {
  // Apply schema influence
  const schemaResult = applyBranchInfluenceToSchemas(
    currentSchemas,
    branch,
    influenceWeight
  )

  // Apply mixed node influence
  const nodeResult = applyBranchInfluenceToMixedNodes(
    currentNodes,
    branch,
    influenceWeight
  )

  return {
    influencedSchemas: schemaResult.schemas,
    influencedMixedNodes: nodeResult.nodes,
    notes: [...schemaResult.notes, ...nodeResult.notes],
  }
}
