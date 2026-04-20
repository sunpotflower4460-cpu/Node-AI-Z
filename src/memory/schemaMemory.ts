/**
 * Schema Memory
 * Phase M4: Manages schema patterns extracted from episodic traces.
 *
 * Schema patterns represent recurring tendencies that emerge when similar
 * experiences repeat over time. Unlike episodic traces (one-time events),
 * schemas capture what happens "repeatedly" or "characteristically".
 */

import type { SchemaPattern, SchemaMemoryState } from './types'

/**
 * Generates a pattern key from proto meanings, textures, and tendencies.
 * This key is used to identify similar patterns across traces.
 */
export const generateSchemaKey = (
  protoMeaningIds: string[],
  textureTags: string[],
  optionTendencyKeys: string[],
  somaticSignatureKeys: string[],
): string => {
  // Sort for consistency
  const sortedMeanings = [...protoMeaningIds].sort()
  const sortedTextures = [...textureTags].sort()
  const sortedOptions = [...optionTendencyKeys].sort()
  const sortedSomatics = [...somaticSignatureKeys].sort()

  // Combine into a key
  const parts: string[] = []

  if (sortedMeanings.length > 0) {
    parts.push(`meaning:${sortedMeanings.join('+')}`)
  }
  if (sortedTextures.length > 0) {
    parts.push(`texture:${sortedTextures.join('+')}`)
  }
  if (sortedOptions.length > 0) {
    parts.push(`option:${sortedOptions.join('+')}`)
  }
  if (sortedSomatics.length > 0) {
    parts.push(`somatic:${sortedSomatics.join('+')}`)
  }

  return parts.join('|')
}

/**
 * Creates a new schema pattern from initial trace information.
 */
export const createSchemaPattern = (
  protoMeaningIds: string[],
  textureTags: string[],
  optionTendencyKeys: string[],
  somaticSignatureKeys: string[],
  supportingTraceId: string,
  currentTurn: number,
): SchemaPattern => {
  const key = generateSchemaKey(
    protoMeaningIds,
    textureTags,
    optionTendencyKeys,
    somaticSignatureKeys,
  )

  const id = `schema_${currentTurn}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    id,
    key,
    dominantProtoMeaningIds: protoMeaningIds,
    dominantTextureTags: textureTags,
    optionTendencyKeys,
    somaticSignatureKeys,
    recurrenceCount: 1,
    strength: 0.3, // Initial strength is low
    confidence: 0.2, // Initial confidence is low (single observation)
    supportingTraceIds: [supportingTraceId],
    firstSeenTurn: currentTurn,
    lastReinforcedTurn: currentTurn,
  }
}

/**
 * Reinforces an existing schema pattern with new evidence.
 */
export const reinforceSchemaPattern = (
  pattern: SchemaPattern,
  supportingTraceId: string,
  currentTurn: number,
): SchemaPattern => {
  // Don't add duplicate trace IDs
  const newTraceIds = pattern.supportingTraceIds.includes(supportingTraceId)
    ? pattern.supportingTraceIds
    : [...pattern.supportingTraceIds, supportingTraceId]

  const newRecurrence = pattern.recurrenceCount + 1

  // Strength increases with recurrence, but with diminishing returns
  const newStrength = Math.min(
    pattern.strength + 0.15 / Math.sqrt(newRecurrence),
    1.0,
  )

  // Confidence increases as pattern is observed across multiple turns
  const turnSpread = currentTurn - pattern.firstSeenTurn
  const confidenceBoost = turnSpread > 5 ? 0.15 : 0.1 // More confident if pattern persists over time
  const newConfidence = Math.min(pattern.confidence + confidenceBoost, 1.0)

  return {
    ...pattern,
    recurrenceCount: newRecurrence,
    strength: newStrength,
    confidence: newConfidence,
    supportingTraceIds: newTraceIds,
    lastReinforcedTurn: currentTurn,
  }
}

/**
 * Finds an existing schema pattern by key.
 */
export const findSchemaByKey = (
  schemaMemory: SchemaMemoryState,
  key: string,
): SchemaPattern | undefined => {
  return schemaMemory.patterns.find((pattern) => pattern.key === key)
}

/**
 * Adds a new schema pattern to memory.
 */
export const addSchemaPattern = (
  schemaMemory: SchemaMemoryState,
  pattern: SchemaPattern,
): SchemaMemoryState => {
  return {
    ...schemaMemory,
    patterns: [...schemaMemory.patterns, pattern],
  }
}

/**
 * Updates an existing schema pattern in memory.
 */
export const updateSchemaPattern = (
  schemaMemory: SchemaMemoryState,
  updatedPattern: SchemaPattern,
): SchemaMemoryState => {
  const patterns = schemaMemory.patterns.map((pattern) =>
    pattern.id === updatedPattern.id ? updatedPattern : pattern
  )

  return {
    ...schemaMemory,
    patterns,
  }
}

/**
 * Creates an initial empty schema memory state.
 */
export const createEmptySchemaMemory = (): SchemaMemoryState => {
  return {
    patterns: [],
    lastReplayTurn: 0,
    replayNotes: [],
  }
}
