/**
 * Replay Consolidation
 * Phase M4: Consolidates episodic traces into schema patterns.
 *
 * Replay examines selected traces and determines whether they should:
 * - Form a new schema pattern (promotion)
 * - Reinforce an existing schema pattern
 * - Remain episodic for now
 *
 * Key principle: Single high-surprise events do NOT immediately become schemas.
 * Schemas emerge from repetition and distributed recurrence.
 */

import type {
  EpisodicTrace,
  ReplayCandidate,
  ReplayConsolidationResult,
  SchemaMemoryState,
  SchemaPattern,
} from './types'
import {
  generateSchemaKey,
  createSchemaPattern,
  reinforceSchemaPattern,
  findSchemaByKey,
  addSchemaPattern,
  updateSchemaPattern,
} from './schemaMemory'

export type ReplayConsolidationInput = {
  /** Episodic traces to replay */
  episodicBuffer: EpisodicTrace[]

  /** Schema memory state */
  schemaMemory: SchemaMemoryState

  /** Candidates selected for replay */
  replayCandidates: ReplayCandidate[]

  /** Current turn number (used for time tracking) */
  currentTurn: number
}

/**
 * Extracts option tendency keys from a trace.
 * These represent recurring option-related patterns (ambivalence, bridge-need, etc.)
 */
const extractOptionTendencies = (trace: EpisodicTrace): string[] => {
  // Use unresolved tension keys as option tendencies
  return trace.unresolvedTensionKeys.filter((key) =>
    key.includes('ambivalence') || key.includes('bridge') || key.includes('options')
  )
}

/**
 * Determines if a trace is similar to an existing schema pattern.
 * Returns the matching schema if found.
 */
const findMatchingSchema = (
  trace: EpisodicTrace,
  schemaMemory: SchemaMemoryState,
): SchemaPattern | undefined => {
  const optionTendencies = extractOptionTendencies(trace)
  const somaticKeys = trace.somaticSignatureKey ? [trace.somaticSignatureKey] : []

  const traceKey = generateSchemaKey(
    trace.dominantProtoMeaningIds,
    trace.dominantTextureTags,
    optionTendencies,
    somaticKeys,
  )

  // Exact key match
  const exactMatch = findSchemaByKey(schemaMemory, traceKey)
  if (exactMatch) {
    return exactMatch
  }

  // Fuzzy match: check if trace significantly overlaps with any schema
  for (const pattern of schemaMemory.patterns) {
    let overlapScore = 0

    // Proto meaning overlap
    const meaningOverlap = trace.dominantProtoMeaningIds.filter((id) =>
      pattern.dominantProtoMeaningIds.includes(id)
    ).length
    overlapScore += meaningOverlap * 0.4

    // Texture overlap
    const textureOverlap = trace.dominantTextureTags.filter((tag) =>
      pattern.dominantTextureTags.includes(tag)
    ).length
    overlapScore += textureOverlap * 0.3

    // Option tendency overlap
    const optionOverlap = optionTendencies.filter((key) =>
      pattern.optionTendencyKeys.includes(key)
    ).length
    overlapScore += optionOverlap * 0.2

    // Somatic overlap
    const somaticOverlap = somaticKeys.filter((key) =>
      pattern.somaticSignatureKeys.includes(key)
    ).length
    overlapScore += somaticOverlap * 0.1

    // If overlap is significant, consider it a match
    if (overlapScore > 1.5) {
      return pattern
    }
  }

  return undefined
}

/**
 * Checks if a trace should be promoted to a new schema.
 * Promotion requires evidence of recurrence or significance.
 */
const shouldPromoteToSchema = (
  trace: EpisodicTrace,
  similarTraces: EpisodicTrace[],
  currentTurn: number,
): boolean => {
  // Single extreme event? Not yet
  if (similarTraces.length < 2 && trace.surprise !== undefined && trace.surprise > 0.8) {
    return false // Too early, need more observations
  }

  // Multiple similar traces with good distribution?
  if (similarTraces.length >= 2) {
    // Check if traces are distributed across turns (not just consecutive)
    const turns = similarTraces.map((t) => t.createdAtTurn).sort((a, b) => a - b)
    const turnSpread = turns[turns.length - 1] - turns[0]

    if (turnSpread >= 3) {
      // Good distribution across time
      return true
    }

    if (similarTraces.length >= 3 && turnSpread >= 1) {
      // Many similar traces, even if closer together
      return true
    }
  }

  // High average salience across similar traces?
  const avgSalience = similarTraces.reduce((sum, t) => sum + t.salience, 0) / similarTraces.length
  if (avgSalience > 0.65 && similarTraces.length >= 2) {
    return true
  }

  return false
}

/**
 * Finds traces similar to a given trace within the buffer.
 */
const findSimilarTraces = (
  targetTrace: EpisodicTrace,
  buffer: EpisodicTrace[],
): EpisodicTrace[] => {
  return buffer.filter((trace) => {
    if (trace.id === targetTrace.id) return true // Include self

    // Check overlap in meanings, textures, and tensions
    const meaningOverlap = targetTrace.dominantProtoMeaningIds.filter((id) =>
      trace.dominantProtoMeaningIds.includes(id)
    ).length

    const textureOverlap = targetTrace.dominantTextureTags.filter((tag) =>
      trace.dominantTextureTags.includes(tag)
    ).length

    const tensionOverlap = targetTrace.unresolvedTensionKeys.filter((key) =>
      trace.unresolvedTensionKeys.includes(key)
    ).length

    // Significant overlap?
    return (meaningOverlap >= 2 || textureOverlap >= 1 || tensionOverlap >= 1)
  })
}

/**
 * Runs replay consolidation on selected candidates.
 * Updates schema memory and marks traces as replayed/consolidated.
 */
export const runReplayConsolidation = (
  input: ReplayConsolidationInput,
): {
  result: ReplayConsolidationResult
  updatedSchemaMemory: SchemaMemoryState
  updatedEpisodicBuffer: EpisodicTrace[]
} => {
  const { episodicBuffer, schemaMemory, replayCandidates, currentTurn } = input

  const replayedTraceIds: string[] = []
  const promotedPatterns: SchemaPattern[] = []
  const reinforcedPatternIds: string[] = []
  const archivedTraceIds: string[] = []
  const notes: string[] = []

  let updatedSchemaMemory = schemaMemory
  let updatedBuffer = episodicBuffer

  // Process each candidate
  for (const candidate of replayCandidates) {
    const trace = episodicBuffer.find((t) => t.id === candidate.traceId)
    if (!trace) continue

    replayedTraceIds.push(trace.id)

    // Check if this trace matches an existing schema
    const matchingSchema = findMatchingSchema(trace, updatedSchemaMemory)

    if (matchingSchema) {
      // Reinforce existing schema
      const reinforced = reinforceSchemaPattern(matchingSchema, trace.id, currentTurn)
      updatedSchemaMemory = updateSchemaPattern(updatedSchemaMemory, reinforced)
      reinforcedPatternIds.push(reinforced.id)
      notes.push(`Reinforced schema '${reinforced.key}' (recurrence: ${reinforced.recurrenceCount})`)

      // Mark trace as consolidated
      updatedBuffer = updatedBuffer.map((t) =>
        t.id === trace.id ? { ...t, consolidated: true, replayCount: t.replayCount + 1 } : t
      )
      archivedTraceIds.push(trace.id)
    } else {
      // Check if trace should be promoted to new schema
      const similarTraces = findSimilarTraces(trace, episodicBuffer)

      if (shouldPromoteToSchema(trace, similarTraces, currentTurn)) {
        // Promote to new schema
        const optionTendencies = extractOptionTendencies(trace)
        const somaticKeys = trace.somaticSignatureKey ? [trace.somaticSignatureKey] : []

        const newPattern = createSchemaPattern(
          trace.dominantProtoMeaningIds,
          trace.dominantTextureTags,
          optionTendencies,
          somaticKeys,
          trace.id,
          currentTurn,
        )

        updatedSchemaMemory = addSchemaPattern(updatedSchemaMemory, newPattern)
        promotedPatterns.push(newPattern)
        notes.push(`Promoted new schema '${newPattern.key}' from ${similarTraces.length} similar traces`)

        // Mark trace as consolidated
        updatedBuffer = updatedBuffer.map((t) =>
          t.id === trace.id ? { ...t, consolidated: true, replayCount: t.replayCount + 1 } : t
        )
        archivedTraceIds.push(trace.id)
      } else {
        // Not ready for promotion, just increment replay count
        updatedBuffer = updatedBuffer.map((t) =>
          t.id === trace.id ? { ...t, replayCount: t.replayCount + 1 } : t
        )
        notes.push(`Replayed trace ${trace.id} but not ready for schema promotion`)
      }
    }
  }

  const result: ReplayConsolidationResult = {
    replayedTraceIds,
    promotedPatterns,
    reinforcedPatternIds,
    archivedTraceIds,
    notes,
  }

  return {
    result,
    updatedSchemaMemory,
    updatedEpisodicBuffer: updatedBuffer,
  }
}
