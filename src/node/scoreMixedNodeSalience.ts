/**
 * Score Mixed Node Salience
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Calculates salience, coherence, and novelty for mixed nodes.
 */

import type { MixedLatentNode } from './mixedNodeTypes'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { InteroceptiveState } from '../interoception/interoceptiveState'
import type { SchemaMemoryState } from '../memory/types'

export type ScoreMixedNodeSalienceInput = {
  node: MixedLatentNode
  workspace: WorkspaceState
  interoception: InteroceptiveState
  schemaMemory?: SchemaMemoryState
  surprise?: number
}

/**
 * Score a mixed node's salience, coherence, and novelty.
 *
 * Salience factors:
 * - Source ref strength
 * - Surprise
 * - Unresolved tension in workspace
 * - Interoception alignment
 *
 * Coherence factors:
 * - Source refs don't contradict
 * - Proto/option/body point in same direction
 * - Schema memory partial match
 *
 * Novelty factors:
 * - Distance from existing schemas
 * - First appearance of this intersection
 * - Unusual combination
 */
export const scoreMixedNodeSalience = (input: ScoreMixedNodeSalienceInput): MixedLatentNode => {
  const { node, workspace, interoception, schemaMemory, surprise } = input

  // Calculate salience
  let salienceScore = node.salience // Start with template weight

  // Boost from source ref strength
  const avgSourceWeight = node.sourceRefs.reduce((sum, ref) => sum + ref.weight, 0) / Math.max(node.sourceRefs.length, 1)
  salienceScore += avgSourceWeight * 0.3

  // Boost from surprise
  if (surprise && surprise > 0.5) {
    salienceScore += (surprise - 0.5) * 0.2
  }

  // Boost from workspace unresolved items
  const unresolvedCount = workspace.heldItems.filter((item) => item.strength > 0.5).length
  if (unresolvedCount > 2) {
    salienceScore += Math.min(unresolvedCount / 10, 0.15)
  }

  // Boost from interoception alignment
  // If node tags match current interoceptive state, boost
  if (node.tags.includes('fatigue') && interoception.energy < 0.4) {
    salienceScore += 0.1
  }
  if (node.tags.includes('openness') && interoception.socialSafety > 0.5) {
    salienceScore += 0.1
  }
  if (node.tags.includes('curiosity') && interoception.noveltyHunger > 0.6) {
    salienceScore += 0.1
  }

  // Normalize salience to 0-1
  salienceScore = Math.min(Math.max(salienceScore, 0.0), 1.0)

  // Calculate coherence
  let coherenceScore = 0.5 // Start neutral

  // Check if source refs are mutually consistent
  const hasProto = node.sourceRefs.some((ref) => ref.sourceType === 'proto')
  const hasOption = node.sourceRefs.some((ref) => ref.sourceType === 'option')
  const hasInteroception = node.sourceRefs.some((ref) => ref.sourceType === 'interoception')
  const hasWorkspace = node.sourceRefs.some((ref) => ref.sourceType === 'workspace')

  // Multiple source types = higher coherence
  const sourceTypeCount = [hasProto, hasOption, hasInteroception, hasWorkspace].filter(Boolean).length
  coherenceScore += sourceTypeCount * 0.1

  // Schema memory partial match increases coherence
  if (schemaMemory) {
    const relatedSchemas = schemaMemory.patterns.filter((p) =>
      node.tags.some((tag) => p.dominantTextureTags.includes(tag))
    )
    if (relatedSchemas.length > 0) {
      const avgSchemaStrength = relatedSchemas.reduce((sum, s) => sum + s.strength, 0) / relatedSchemas.length
      coherenceScore += avgSchemaStrength * 0.2
    }
  }

  // High source weight variance = lower coherence
  const sourceWeights = node.sourceRefs.map((ref) => ref.weight)
  const avgWeight = sourceWeights.reduce((sum, w) => sum + w, 0) / Math.max(sourceWeights.length, 1)
  const variance = sourceWeights.reduce((sum, w) => sum + Math.pow(w - avgWeight, 2), 0) / Math.max(sourceWeights.length, 1)
  coherenceScore -= Math.min(variance, 0.15)

  // Normalize coherence to 0-1
  coherenceScore = Math.min(Math.max(coherenceScore, 0.0), 1.0)

  // Calculate novelty
  let noveltyScore = 0.5 // Start neutral

  // Distance from existing schemas
  if (schemaMemory) {
    const exactMatch = schemaMemory.patterns.find((p) => p.key === node.key)
    if (exactMatch) {
      // Exact match = low novelty
      noveltyScore -= exactMatch.strength * 0.4
    } else {
      // Partial match = medium novelty
      const partialMatches = schemaMemory.patterns.filter((p) =>
        node.tags.some((tag) => p.dominantTextureTags.includes(tag))
      )
      if (partialMatches.length > 0) {
        const avgMatchStrength = partialMatches.reduce((sum, s) => sum + s.strength, 0) / partialMatches.length
        noveltyScore -= avgMatchStrength * 0.2
      } else {
        // No match = high novelty
        noveltyScore += 0.3
      }
    }
  } else {
    // No schema memory = everything is novel
    noveltyScore += 0.2
  }

  // Unusual axis combinations = higher novelty
  if (node.axes.length >= 4) {
    noveltyScore += 0.15
  }

  // Surprise boosts novelty
  if (surprise && surprise > 0.6) {
    noveltyScore += (surprise - 0.6) * 0.25
  }

  // Normalize novelty to 0-1
  noveltyScore = Math.min(Math.max(noveltyScore, 0.0), 1.0)

  return {
    ...node,
    salience: salienceScore,
    coherence: coherenceScore,
    novelty: noveltyScore,
  }
}
