/**
 * Shared Trunk - Phase M9
 * Read-mostly repository of universal patterns and knowledge.
 * Updated rarely through promotion from personal branches.
 */

import type { SharedTrunkState } from './coreTypes'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'

const SHARED_TRUNK_STORAGE_KEY = 'nodeaiz:core:shared-trunk'

/**
 * Create an empty shared trunk state.
 * Used for initialization when no trunk exists yet.
 */
export const createEmptySharedTrunk = (): SharedTrunkState => {
  return {
    trunkId: `trunk-${Date.now()}`,
    schemaPatterns: [],
    conceptualBiases: {},
    promotedMixedNodes: [],
    protoMeaningBias: {},
    optionDetectionBias: {},
    version: 1,
    lastUpdatedAt: Date.now(),
    notes: ['Empty shared trunk initialized'],
    promotionQueue: [], // Phase M10: Initialize promotion queue
    promotionLogs: [], // Phase M10: Initialize promotion logs
    humanReviewSummaries: [], // Phase M13: Initialize human review state
    humanReviewRecords: [], // Phase M13: Initialize human review records
    trunkApplyRecords: [], // Phase M14: Initialize trunk apply ledger
    trunkRevertRecords: [], // Phase M14: Initialize trunk revert ledger
    trunkSnapshotRecords: [], // Phase M14: Initialize trunk snapshot metadata
    safeUndoNotes: [],
    comparableBranchSummaries: [], // Phase M15: Cross-branch comparison cache
    promotionConsistencyRecords: [], // Phase M15: Cross-branch consistency history
  }
}

export const loadSharedTrunkState = (): SharedTrunkState | undefined => {
  if (typeof localStorage === 'undefined') {
    return undefined
  }

  try {
    const stored = localStorage.getItem(SHARED_TRUNK_STORAGE_KEY)
    if (!stored) {
      return undefined
    }
    return JSON.parse(stored) as SharedTrunkState
  } catch (error) {
    console.warn('Failed to load shared trunk state.', error)
    return undefined
  }
}

export const saveSharedTrunkState = (trunk: SharedTrunkState): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(SHARED_TRUNK_STORAGE_KEY, JSON.stringify(trunk))
  } catch (error) {
    console.warn('Failed to save shared trunk state.', error)
  }
}

export const clearSharedTrunkState = (): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(SHARED_TRUNK_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear shared trunk state.', error)
  }
}

/**
 * Get schema patterns from trunk.
 * Returns only patterns that match optional filter criteria.
 */
export const getTrunkSchemas = (
  trunk: SharedTrunkState,
  filter?: {
    minStrength?: number
    minConfidence?: number
    tags?: string[]
  }
): SchemaPattern[] => {
  let schemas = trunk.schemaPatterns

  if (filter?.minStrength !== undefined) {
    schemas = schemas.filter((s) => s.strength >= filter.minStrength!)
  }

  if (filter?.minConfidence !== undefined) {
    schemas = schemas.filter((s) => s.confidence >= filter.minConfidence!)
  }

  return schemas
}

/**
 * Get promoted mixed nodes from trunk.
 */
export const getTrunkMixedNodes = (
  trunk: SharedTrunkState,
  filter?: {
    minSalience?: number
    minCoherence?: number
    axes?: string[]
  }
): MixedLatentNode[] => {
  let nodes = trunk.promotedMixedNodes

  if (filter?.minSalience !== undefined) {
    nodes = nodes.filter((n) => n.salience >= filter.minSalience!)
  }

  if (filter?.minCoherence !== undefined) {
    nodes = nodes.filter((n) => n.coherence >= filter.minCoherence!)
  }

  return nodes
}

/**
 * Get conceptual bias for a given key.
 */
export const getTrunkBias = (
  trunk: SharedTrunkState,
  key: string,
  defaultValue: number = 0.0
): number => {
  return trunk.conceptualBiases[key] ?? defaultValue
}

/**
 * Get proto-meaning bias for a given proto ID.
 */
export const getTrunkProtoMeaningBias = (
  trunk: SharedTrunkState,
  protoId: string,
  defaultValue: number = 0.0
): number => {
  return trunk.protoMeaningBias[protoId] ?? defaultValue
}

/**
 * Get option detection bias for a given option type.
 */
export const getTrunkOptionBias = (
  trunk: SharedTrunkState,
  optionType: string,
  defaultValue: number = 0.0
): number => {
  return trunk.optionDetectionBias[optionType] ?? defaultValue
}

/**
 * Add a promoted schema to trunk.
 * This is called when a personal branch schema is approved for promotion.
 */
export const addPromotedSchema = (
  trunk: SharedTrunkState,
  schema: SchemaPattern
): SharedTrunkState => {
  // Check if schema with same key already exists
  const existingIndex = trunk.schemaPatterns.findIndex((s) => s.key === schema.key)

  let updatedPatterns: SchemaPattern[]
  if (existingIndex >= 0) {
    // Merge with existing schema (increase strength, confidence)
    const existing = trunk.schemaPatterns[existingIndex]
    const merged: SchemaPattern = {
      ...existing,
      recurrenceCount: existing.recurrenceCount + schema.recurrenceCount,
      strength: Math.min(1.0, existing.strength + schema.strength * 0.1),
      confidence: Math.min(1.0, existing.confidence + schema.confidence * 0.1),
      supportingTraceIds: [...existing.supportingTraceIds, ...schema.supportingTraceIds],
      lastReinforcedTurn: schema.lastReinforcedTurn,
    }
    updatedPatterns = [
      ...trunk.schemaPatterns.slice(0, existingIndex),
      merged,
      ...trunk.schemaPatterns.slice(existingIndex + 1),
    ]
  } else {
    // Add as new schema
    updatedPatterns = [...trunk.schemaPatterns, schema]
  }

  return {
    ...trunk,
    schemaPatterns: updatedPatterns,
    version: trunk.version + 1,
    lastUpdatedAt: Date.now(),
    notes: [...trunk.notes, `Promoted schema: ${schema.key}`],
  }
}

/**
 * Add a promoted mixed node to trunk.
 */
export const addPromotedMixedNode = (
  trunk: SharedTrunkState,
  node: MixedLatentNode
): SharedTrunkState => {
  // Check if node with same key already exists
  const existingIndex = trunk.promotedMixedNodes.findIndex((n) => n.key === node.key)

  let updatedNodes: MixedLatentNode[]
  if (existingIndex >= 0) {
    // Merge with existing node (increase salience, coherence)
    const existing = trunk.promotedMixedNodes[existingIndex]
    const merged: MixedLatentNode = {
      ...existing,
      salience: Math.min(1.0, existing.salience + node.salience * 0.1),
      coherence: Math.min(1.0, existing.coherence + node.coherence * 0.1),
      novelty: node.novelty * 0.5, // Reduce novelty as it becomes trunk
      tags: Array.from(new Set([...existing.tags, ...node.tags])),
    }
    updatedNodes = [
      ...trunk.promotedMixedNodes.slice(0, existingIndex),
      merged,
      ...trunk.promotedMixedNodes.slice(existingIndex + 1),
    ]
  } else {
    // Add as new node
    updatedNodes = [...trunk.promotedMixedNodes, node]
  }

  return {
    ...trunk,
    promotedMixedNodes: updatedNodes,
    version: trunk.version + 1,
    lastUpdatedAt: Date.now(),
    notes: [...trunk.notes, `Promoted mixed node: ${node.key}`],
  }
}

/**
 * Update conceptual bias in trunk.
 */
export const updateTrunkBias = (
  trunk: SharedTrunkState,
  key: string,
  delta: number
): SharedTrunkState => {
  const currentValue = trunk.conceptualBiases[key] ?? 0.0
  const newValue = Math.max(-1.0, Math.min(1.0, currentValue + delta))

  return {
    ...trunk,
    conceptualBiases: {
      ...trunk.conceptualBiases,
      [key]: newValue,
    },
    version: trunk.version + 1,
    lastUpdatedAt: Date.now(),
  }
}
