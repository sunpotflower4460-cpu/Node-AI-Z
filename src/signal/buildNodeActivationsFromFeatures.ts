import type { ChunkFeature } from './chunkTypes'
import type { CoreNode } from '../types/nodeStudio'
import type { PlasticityState } from '../revision/types'
import { CORE_NODES } from '../core/nodeData'
import { clampNumber, clampPlasticityValue, PLASTICITY_LIMITS } from '../revision/defaultPlasticityState'

const MAX_NODE_SCORE = 0.99

/**
 * Mapping: feature id → list of { nodeId, weight } pairs.
 *
 * These weights represent how much a given feature contributes to the
 * base activation score of a node.  Weights are on the 0–1 scale and
 * will be combined (sum, then clamped) if multiple features target the
 * same node.
 */
const FEATURE_TO_NODE: Record<string, Array<{ nodeId: string; weight: number }>> = {
  motivation_drop: [
    { nodeId: 'fatigue', weight: 0.8 },
    { nodeId: 'anxiety', weight: 0.3 },
    { nodeId: 'self_doubt', weight: 0.2 },
  ],
  monotony: [
    { nodeId: 'routine', weight: 0.85 },
    { nodeId: 'fatigue', weight: 0.3 },
    { nodeId: 'wanting_change', weight: 0.2 },
  ],
  purpose_confusion: [
    { nodeId: 'ambiguity', weight: 0.8 },
    { nodeId: 'vague_discomfort', weight: 0.6 },
    { nodeId: 'self_doubt', weight: 0.3 },
  ],
  temporal_contrast: [
    { nodeId: 'chronicity', weight: 0.8 },
    { nodeId: 'fatigue', weight: 0.2 },
  ],
  explicit_guidance_request: [
    { nodeId: 'wanting_change', weight: 0.75 },
    { nodeId: 'leaving', weight: 0.55 },
    { nodeId: 'anxiety', weight: 0.3 },
  ],
  distress_signal: [
    { nodeId: 'anxiety', weight: 0.7 },
    { nodeId: 'safety', weight: 0.5 },
    { nodeId: 'seeking_understanding', weight: 0.4 },
  ],
  longing_for_recognition: [
    { nodeId: 'seeking_understanding', weight: 0.85 },
    { nodeId: 'loneliness', weight: 0.5 },
  ],
  hope_signal: [
    { nodeId: 'faint_hope', weight: 0.8 },
  ],
  self_critique: [
    { nodeId: 'self_doubt', weight: 0.85 },
    { nodeId: 'anxiety', weight: 0.3 },
  ],
  uncertainty_expression: [
    { nodeId: 'vague_discomfort', weight: 0.8 },
    { nodeId: 'ambiguity', weight: 0.7 },
  ],
}

/**
 * Build CoreNode activations from active features.
 *
 * Each node that receives contributions gets an `activationProfile` that
 * records which feature id contributed how much (feature.strength × weight).
 *
 * A plasticity node boost may be added on top of the feature-derived base.
 */
export const buildNodeActivationsFromFeatures = (
  features: ChunkFeature[],
  plasticity?: PlasticityState,
): CoreNode[] => {
  // Accumulate per-node: { totalScore, profile }
  const nodeAccum: Map<string, { totalScore: number; profile: Record<string, number> }> = new Map()

  for (const feature of features) {
    const mappings = FEATURE_TO_NODE[feature.id]
    if (!mappings) continue

    for (const { nodeId, weight } of mappings) {
      const contribution = feature.strength * weight
      const existing = nodeAccum.get(nodeId) ?? { totalScore: 0, profile: {} }
      existing.totalScore += contribution
      existing.profile[feature.id] = (existing.profile[feature.id] ?? 0) + contribution
      nodeAccum.set(nodeId, existing)
    }
  }

  const nodes: CoreNode[] = []

  for (const [nodeId, { totalScore, profile }] of nodeAccum.entries()) {
    const coreDef = CORE_NODES.find((n) => n.id === nodeId)
    if (!coreDef) continue

    const baseScore = Math.min(totalScore, 0.95)
    const nodeBoost = clampPlasticityValue(plasticity?.nodeBoosts[nodeId] ?? 0, PLASTICITY_LIMITS.node)
    const value = clampNumber(baseScore + nodeBoost, 0, MAX_NODE_SCORE)

    const reasons = [
      `feature 発火から立ち上がり: ${Object.keys(profile).join(', ')}`,
    ]
    if (nodeBoost !== 0) {
      reasons.push(`plasticity node boost: ${nodeBoost > 0 ? '+' : ''}${nodeBoost.toFixed(3)}`)
    }

    nodes.push({
      id: nodeId,
      label: coreDef.label,
      category: coreDef.category,
      value,
      reasons,
      activationProfile: profile,
    })
  }

  return nodes
}
