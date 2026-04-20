/**
 * Resolve Core View - Phase M9
 * Combines Shared Trunk + Personal Branch + App Facade into a unified view.
 * This is what the runtime actually sees and uses.
 */

import type {
  CoreView,
  SharedTrunkState,
  PersonalBranchState,
  AppFacadeConfig,
  CoreLayerScope,
  PromotionCandidate,
} from './coreTypes'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import { getTrunkSchemas, getTrunkMixedNodes } from './sharedTrunk'
import { getBranchSchemas, getBranchMixedNodes } from './personalBranch'
import { getEffectiveInfluenceWeights } from './appFacade'

/**
 * Resolve a unified core view from trunk, branch, and facade.
 * This merges all layers according to facade permissions and weights.
 */
export const resolveCoreView = (
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  facade: AppFacadeConfig,
  promotionCandidates: PromotionCandidate[] = []
): CoreView => {
  const weights = getEffectiveInfluenceWeights(facade)

  // Merge schemas from trunk and branch
  const activeSchemas = mergeSchemas(trunk, branch, facade, weights)

  // Merge mixed nodes from trunk and branch
  const activeMixedNodes = mergeMixedNodes(trunk, branch, facade, weights)

  // Merge biases
  const mergedBiases = mergeBiases(trunk, branch, weights)

  // Merge proto-meaning weights
  const mergedProtoWeights = mergeProtoWeights(trunk, branch, weights)

  return {
    activeSchemas,
    activeMixedNodes,
    mergedBiases,
    mergedProtoWeights,
    sessionBrainState: branch.sessionBrainState,
    promotionCandidates,
    influenceNotes: [], // Will be populated during runtime
  }
}

/**
 * Merge schemas from trunk and branch.
 */
const mergeSchemas = (
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  facade: AppFacadeConfig,
  weights: { trunkWeight: number; branchWeight: number }
): Array<SchemaPattern & { origin: CoreLayerScope }> => {
  const schemas: Array<SchemaPattern & { origin: CoreLayerScope }> = []

  // Add trunk schemas if facade allows
  if (facade.canReadTrunk) {
    const trunkSchemas = getTrunkSchemas(trunk, {
      minStrength: 0.3, // Only use established trunk patterns
      minConfidence: 0.3,
    })

    for (const schema of trunkSchemas) {
      // Apply trunk weight to influence
      const weightedSchema: SchemaPattern & { origin: CoreLayerScope } = {
        ...schema,
        strength: schema.strength * weights.trunkWeight,
        confidence: schema.confidence * weights.trunkWeight,
        origin: 'shared_trunk',
      }

      // Apply facade filter if it exists
      if (!facade.visibleSchemaFilter || facade.visibleSchemaFilter(schema)) {
        schemas.push(weightedSchema)
      }
    }
  }

  // Add branch schemas if facade allows
  if (facade.canReadBranch) {
    const branchSchemas = getBranchSchemas(branch, {
      minStrength: 0.2, // Branch patterns can be newer/weaker
      minConfidence: 0.2,
    })

    for (const schema of branchSchemas) {
      // Apply branch weight to influence
      const weightedSchema: SchemaPattern & { origin: CoreLayerScope } = {
        ...schema,
        strength: schema.strength * weights.branchWeight,
        confidence: schema.confidence * weights.branchWeight,
        origin: 'personal_branch',
      }

      // Apply facade filter if it exists
      if (!facade.visibleSchemaFilter || facade.visibleSchemaFilter(schema)) {
        schemas.push(weightedSchema)
      }
    }
  }

  // Sort by weighted strength (strongest first)
  return schemas.sort((a, b) => b.strength - a.strength)
}

/**
 * Merge mixed nodes from trunk and branch.
 */
const mergeMixedNodes = (
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  facade: AppFacadeConfig,
  weights: { trunkWeight: number; branchWeight: number }
): Array<MixedLatentNode & { origin: CoreLayerScope }> => {
  const nodes: Array<MixedLatentNode & { origin: CoreLayerScope }> = []

  // Add trunk nodes if facade allows
  if (facade.canReadTrunk) {
    const trunkNodes = getTrunkMixedNodes(trunk, {
      minSalience: 0.3,
      minCoherence: 0.3,
    })

    for (const node of trunkNodes) {
      // Apply trunk weight to influence
      const weightedNode: MixedLatentNode & { origin: CoreLayerScope } = {
        ...node,
        salience: node.salience * weights.trunkWeight,
        coherence: node.coherence * weights.trunkWeight,
        origin: 'shared_trunk',
      }

      // Apply facade filter if it exists
      if (!facade.visibleMixedNodeFilter || facade.visibleMixedNodeFilter(node)) {
        nodes.push(weightedNode)
      }
    }
  }

  // Add branch nodes if facade allows
  if (facade.canReadBranch) {
    const branchNodes = getBranchMixedNodes(branch, {
      minSalience: 0.2,
      minCoherence: 0.2,
    })

    for (const node of branchNodes) {
      // Apply branch weight to influence
      const weightedNode: MixedLatentNode & { origin: CoreLayerScope } = {
        ...node,
        salience: node.salience * weights.branchWeight,
        coherence: node.coherence * weights.branchWeight,
        origin: 'personal_branch',
      }

      // Apply facade filter if it exists
      if (!facade.visibleMixedNodeFilter || facade.visibleMixedNodeFilter(node)) {
        nodes.push(weightedNode)
      }
    }
  }

  // Sort by weighted salience (most salient first)
  return nodes.sort((a, b) => b.salience - a.salience)
}

/**
 * Merge conceptual biases from trunk and branch.
 */
const mergeBiases = (
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  weights: { trunkWeight: number; branchWeight: number }
): Record<string, number> => {
  const merged: Record<string, number> = {}

  // Get all unique bias keys
  const allKeys = new Set([
    ...Object.keys(trunk.conceptualBiases),
    ...Object.keys(branch.personalBiases),
  ])

  for (const key of allKeys) {
    const trunkValue = trunk.conceptualBiases[key] ?? 0.0
    const branchValue = branch.personalBiases[key] ?? 0.0

    // Weighted average
    merged[key] = trunkValue * weights.trunkWeight + branchValue * weights.branchWeight
  }

  return merged
}

/**
 * Merge proto-meaning weights from trunk and branch.
 */
const mergeProtoWeights = (
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  weights: { trunkWeight: number; branchWeight: number }
): Record<string, number> => {
  const merged: Record<string, number> = {}

  // Get all unique proto weight keys
  const allKeys = new Set([
    ...Object.keys(trunk.protoMeaningBias),
    ...Object.keys(branch.personalProtoWeights),
  ])

  for (const key of allKeys) {
    const trunkValue = trunk.protoMeaningBias[key] ?? 0.0
    const branchValue = branch.personalProtoWeights[key] ?? 0.0

    // Weighted average
    merged[key] = trunkValue * weights.trunkWeight + branchValue * weights.branchWeight
  }

  return merged
}
