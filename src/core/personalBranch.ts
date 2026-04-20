/**
 * Personal Branch - Phase M9
 * User-specific learned patterns, memories, and active session state.
 * This is where active learning and growth happens.
 */

import type { PersonalBranchState } from './coreTypes'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import { createInitialBrainState } from '../brain/createInitialBrainState'

/**
 * Create an empty personal branch state.
 * Used for new users or initialization.
 */
export const createEmptyPersonalBranch = (userId: string): PersonalBranchState => {
  return {
    branchId: userId,
    personalSchemas: [],
    personalMixedNodes: [],
    pathwayStrengths: new Map(),
    somaticMarkers: new Map(),
    personalBiases: {},
    personalProtoWeights: {},
    sessionBrainState: createInitialBrainState(),
    version: 1,
    lastUpdatedAt: Date.now(),
    notes: ['Empty personal branch initialized'],
  }
}

/**
 * Get personal schemas from branch.
 */
export const getBranchSchemas = (
  branch: PersonalBranchState,
  filter?: {
    minStrength?: number
    minConfidence?: number
  }
): SchemaPattern[] => {
  let schemas = branch.personalSchemas

  if (filter?.minStrength !== undefined) {
    schemas = schemas.filter((s) => s.strength >= filter.minStrength!)
  }

  if (filter?.minConfidence !== undefined) {
    schemas = schemas.filter((s) => s.confidence >= filter.minConfidence!)
  }

  return schemas
}

/**
 * Get personal mixed nodes from branch.
 */
export const getBranchMixedNodes = (
  branch: PersonalBranchState,
  filter?: {
    minSalience?: number
    minCoherence?: number
  }
): MixedLatentNode[] => {
  let nodes = branch.personalMixedNodes

  if (filter?.minSalience !== undefined) {
    nodes = nodes.filter((n) => n.salience >= filter.minSalience!)
  }

  if (filter?.minCoherence !== undefined) {
    nodes = nodes.filter((n) => n.coherence >= filter.minCoherence!)
  }

  return nodes
}

/**
 * Get pathway strength for a given pathway key.
 */
export const getPathwayStrength = (
  branch: PersonalBranchState,
  pathwayKey: string,
  defaultValue: number = 0.5
): number => {
  return branch.pathwayStrengths.get(pathwayKey) ?? defaultValue
}

/**
 * Get somatic marker for a given marker key.
 */
export const getSomaticMarker = (
  branch: PersonalBranchState,
  markerKey: string,
  defaultValue: number = 0.0
): number => {
  return branch.somaticMarkers.get(markerKey) ?? defaultValue
}

/**
 * Get personal bias for a given key.
 */
export const getBranchBias = (
  branch: PersonalBranchState,
  key: string,
  defaultValue: number = 0.0
): number => {
  return branch.personalBiases[key] ?? defaultValue
}

/**
 * Update personal schema in branch.
 * Adds new schema or merges with existing.
 */
export const updateBranchSchema = (
  branch: PersonalBranchState,
  schema: SchemaPattern
): PersonalBranchState => {
  const existingIndex = branch.personalSchemas.findIndex((s) => s.key === schema.key)

  let updatedSchemas: SchemaPattern[]
  if (existingIndex >= 0) {
    // Merge with existing
    const existing = branch.personalSchemas[existingIndex]
    const merged: SchemaPattern = {
      ...existing,
      recurrenceCount: existing.recurrenceCount + 1,
      strength: Math.min(1.0, existing.strength + 0.05),
      confidence: Math.min(1.0, existing.confidence + 0.05),
      supportingTraceIds: [...existing.supportingTraceIds, ...schema.supportingTraceIds],
      lastReinforcedTurn: schema.lastReinforcedTurn,
    }
    updatedSchemas = [
      ...branch.personalSchemas.slice(0, existingIndex),
      merged,
      ...branch.personalSchemas.slice(existingIndex + 1),
    ]
  } else {
    // Add new
    updatedSchemas = [...branch.personalSchemas, schema]
  }

  return {
    ...branch,
    personalSchemas: updatedSchemas,
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update personal mixed node in branch.
 */
export const updateBranchMixedNode = (
  branch: PersonalBranchState,
  node: MixedLatentNode
): PersonalBranchState => {
  const existingIndex = branch.personalMixedNodes.findIndex((n) => n.key === node.key)

  let updatedNodes: MixedLatentNode[]
  if (existingIndex >= 0) {
    // Merge with existing
    const existing = branch.personalMixedNodes[existingIndex]
    const merged: MixedLatentNode = {
      ...existing,
      salience: Math.min(1.0, (existing.salience + node.salience) / 2),
      coherence: Math.min(1.0, existing.coherence + 0.05),
      novelty: node.novelty * 0.7, // Reduce novelty over time
      tags: Array.from(new Set([...existing.tags, ...node.tags])),
    }
    updatedNodes = [
      ...branch.personalMixedNodes.slice(0, existingIndex),
      merged,
      ...branch.personalMixedNodes.slice(existingIndex + 1),
    ]
  } else {
    // Add new
    updatedNodes = [...branch.personalMixedNodes, node]
  }

  return {
    ...branch,
    personalMixedNodes: updatedNodes,
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update pathway strength in branch.
 */
export const updatePathwayStrength = (
  branch: PersonalBranchState,
  pathwayKey: string,
  delta: number
): PersonalBranchState => {
  const currentValue = branch.pathwayStrengths.get(pathwayKey) ?? 0.5
  const newValue = Math.max(0.0, Math.min(1.0, currentValue + delta))

  const updatedPathways = new Map(branch.pathwayStrengths)
  updatedPathways.set(pathwayKey, newValue)

  return {
    ...branch,
    pathwayStrengths: updatedPathways,
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update somatic marker in branch.
 */
export const updateSomaticMarker = (
  branch: PersonalBranchState,
  markerKey: string,
  delta: number
): PersonalBranchState => {
  const currentValue = branch.somaticMarkers.get(markerKey) ?? 0.0
  const newValue = Math.max(-1.0, Math.min(1.0, currentValue + delta))

  const updatedMarkers = new Map(branch.somaticMarkers)
  updatedMarkers.set(markerKey, newValue)

  return {
    ...branch,
    somaticMarkers: updatedMarkers,
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update session brain state in branch.
 */
export const updateBranchSessionState = (
  branch: PersonalBranchState,
  sessionBrainState: SessionBrainState
): PersonalBranchState => {
  return {
    ...branch,
    sessionBrainState,
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update personal bias in branch.
 */
export const updateBranchBias = (
  branch: PersonalBranchState,
  key: string,
  delta: number
): PersonalBranchState => {
  const currentValue = branch.personalBiases[key] ?? 0.0
  const newValue = Math.max(-1.0, Math.min(1.0, currentValue + delta))

  return {
    ...branch,
    personalBiases: {
      ...branch.personalBiases,
      [key]: newValue,
    },
    version: branch.version + 1,
    lastUpdatedAt: Date.now(),
  }
}
