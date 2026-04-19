/**
 * Apply Schema Influence
 * Phase M4: Lets schema patterns subtly influence current turn processing.
 *
 * Schemas do NOT dominate. They gently tilt processing based on recurring patterns.
 * This prevents the system from becoming rigid while allowing accumulated experience
 * to inform current decisions.
 */

import type { SchemaMemoryState, SchemaInfluenceNote } from './types'
import type { FusedState } from '../fusion/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'
import type { OptionDecision } from '../option/mapOptionAwarenessToDecision'

export type ApplySchemaInfluenceInput = {
  /** Current fused state */
  fusedState: FusedState

  /** Sensory proto meanings */
  sensoryProtoMeanings: ProtoMeaning[]

  /** Narrative proto meanings */
  narrativeProtoMeanings: ProtoMeaning[]

  /** Option awareness */
  optionAwareness?: OptionAwareness

  /** Option decision */
  optionDecision?: OptionDecision

  /** Schema memory state */
  schemaMemory: SchemaMemoryState

  /** Current turn number */
  currentTurn: number
}

/**
 * Finds schemas relevant to the current turn based on content overlap.
 */
const findRelevantSchemas = (
  input: ApplySchemaInfluenceInput,
): Array<{ schema: typeof input.schemaMemory.patterns[0]; relevance: number }> => {
  const { sensoryProtoMeanings, narrativeProtoMeanings, schemaMemory } = input

  const currentMeaningIds = [
    ...sensoryProtoMeanings.map((m) => m.id),
    ...narrativeProtoMeanings.map((m) => m.id),
  ]

  const relevantSchemas = schemaMemory.patterns
    .map((pattern) => {
      let relevance = 0

      // Proto meaning overlap
      const meaningOverlap = pattern.dominantProtoMeaningIds.filter((id) =>
        currentMeaningIds.includes(id)
      ).length
      relevance += meaningOverlap * 0.4

      // Recent reinforcement boosts relevance
      const turnsSinceReinforcement = input.currentTurn - pattern.lastReinforcedTurn
      if (turnsSinceReinforcement < 5) {
        relevance += 0.3
      } else if (turnsSinceReinforcement < 10) {
        relevance += 0.15
      }

      // Strong patterns are more relevant
      relevance += pattern.strength * 0.3

      return { schema: pattern, relevance }
    })
    .filter((item) => item.relevance > 0.3) // Only keep meaningfully relevant schemas
    .sort((a, b) => b.relevance - a.relevance)

  return relevantSchemas
}

/**
 * Applies schema influence to fused state.
 * Recurring tensions may be preserved in integratedTensions.
 */
const applySchemaToFusedState = (
  fusedState: FusedState,
  relevantSchemas: ReturnType<typeof findRelevantSchemas>,
  notes: SchemaInfluenceNote[],
): FusedState => {
  let updated = fusedState

  for (const { schema, relevance } of relevantSchemas.slice(0, 2)) {
    // Only top 2 schemas
    // If schema shows recurring unresolved patterns, slightly boost integrated tensions
    if (schema.optionTendencyKeys.some((key) => key.includes('ambivalence') || key.includes('tension'))) {
      const delta = relevance * 0.05 // Small boost
      updated = {
        ...updated,
        integratedTensions: Math.min((updated.integratedTensions ?? 0) + delta, 1.0),
      }

      notes.push({
        patternId: schema.id,
        target: 'fused',
        delta,
        reason: `Schema shows recurring tension pattern`,
      })
    }
  }

  return updated
}

/**
 * Applies schema influence to proto meanings.
 * Previously prominent narratives get slight foregrounding boost.
 */
const applySchemaToProtoMeanings = (
  sensoryMeanings: ProtoMeaning[],
  narrativeMeanings: ProtoMeaning[],
  relevantSchemas: ReturnType<typeof findRelevantSchemas>,
  notes: SchemaInfluenceNote[],
): {
  sensory: ProtoMeaning[]
  narrative: ProtoMeaning[]
} => {
  let updatedSensory = sensoryMeanings
  let updatedNarrative = narrativeMeanings

  for (const { schema, relevance } of relevantSchemas.slice(0, 2)) {
    // Boost meanings that appear in schema
    updatedNarrative = updatedNarrative.map((meaning) => {
      if (schema.dominantProtoMeaningIds.includes(meaning.id)) {
        const boost = relevance * schema.confidence * 0.08 // Small boost
        notes.push({
          patternId: schema.id,
          target: 'proto',
          delta: boost,
          reason: `Schema reinforces recurring narrative '${meaning.label}'`,
        })
        return {
          ...meaning,
          activation: Math.min(meaning.activation + boost, 1.0),
        }
      }
      return meaning
    })
  }

  return { sensory: updatedSensory, narrative: updatedNarrative }
}

/**
 * Applies schema influence to option awareness.
 * Recurring ambivalence or bridge-need patterns may slightly boost current values.
 */
const applySchemaToOptions = (
  optionAwareness: OptionAwareness,
  relevantSchemas: ReturnType<typeof findRelevantSchemas>,
  notes: SchemaInfluenceNote[],
): OptionAwareness => {
  let updated = optionAwareness

  for (const { schema, relevance } of relevantSchemas.slice(0, 2)) {
    // Ambivalence tendency
    if (schema.optionTendencyKeys.includes('high-ambivalence')) {
      const boost = relevance * schema.strength * 0.06
      updated = {
        ...updated,
        ambivalence: Math.min((updated.ambivalence ?? 0) + boost, 1.0),
      }
      notes.push({
        patternId: schema.id,
        target: 'option',
        delta: boost,
        reason: 'Schema shows recurring ambivalence tendency',
      })
    }

    // Bridge need tendency
    if (schema.optionTendencyKeys.includes('bridge-needed')) {
      const boost = relevance * schema.strength * 0.06
      updated = {
        ...updated,
        bridgeNeed: Math.min((updated.bridgeNeed ?? 0) + boost, 1.0),
      }
      notes.push({
        patternId: schema.id,
        target: 'option',
        delta: boost,
        reason: 'Schema shows recurring bridge need',
      })
    }
  }

  return updated
}

/**
 * Applies schema influence to option decision.
 * If schemas show tendency to push too hard or be too vague, adjust answerForce/structureNeed.
 */
const applySchemaToDecision = (
  optionDecision: OptionDecision,
  relevantSchemas: ReturnType<typeof findRelevantSchemas>,
  notes: SchemaInfluenceNote[],
): OptionDecision => {
  let updated = optionDecision

  for (const { schema, relevance } of relevantSchemas.slice(0, 1)) {
    // Only top schema
    // If schema shows pattern of excessive force, dial it down
    if (schema.optionTendencyKeys.some((key) => key.includes('push') || key.includes('force'))) {
      const adjustment = -relevance * schema.confidence * 0.05
      updated = {
        ...updated,
        answerForce: Math.max((updated.answerForce ?? 0.5) + adjustment, 0.0),
      }
      notes.push({
        patternId: schema.id,
        target: 'decision',
        delta: adjustment,
        reason: 'Schema shows recurring excessive force pattern',
      })
    }

    // If schema shows pattern of excessive vagueness, boost structure need
    if (schema.optionTendencyKeys.some((key) => key.includes('vague') || key.includes('unclear'))) {
      const adjustment = relevance * schema.confidence * 0.05
      updated = {
        ...updated,
        structureNeed: Math.min((updated.structureNeed ?? 0.5) + adjustment, 1.0),
      }
      notes.push({
        patternId: schema.id,
        target: 'decision',
        delta: adjustment,
        reason: 'Schema shows recurring vagueness pattern',
      })
    }
  }

  return updated
}

/**
 * Applies schema influence to current turn processing.
 * Returns updated states and influence notes.
 */
export const applySchemaInfluence = (
  input: ApplySchemaInfluenceInput,
): {
  fusedState: FusedState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  optionDecision?: OptionDecision
  influenceNotes: SchemaInfluenceNote[]
} => {
  const notes: SchemaInfluenceNote[] = []

  // Find relevant schemas for current turn
  const relevantSchemas = findRelevantSchemas(input)

  // If no relevant schemas, return unchanged
  if (relevantSchemas.length === 0) {
    return {
      fusedState: input.fusedState,
      sensoryProtoMeanings: input.sensoryProtoMeanings,
      narrativeProtoMeanings: input.narrativeProtoMeanings,
      optionAwareness: input.optionAwareness,
      optionDecision: input.optionDecision,
      influenceNotes: notes,
    }
  }

  // Apply schema influence to each layer
  const fusedState = applySchemaToFusedState(input.fusedState, relevantSchemas, notes)

  const { sensory, narrative } = applySchemaToProtoMeanings(
    input.sensoryProtoMeanings,
    input.narrativeProtoMeanings,
    relevantSchemas,
    notes,
  )

  const optionAwareness = input.optionAwareness
    ? applySchemaToOptions(input.optionAwareness, relevantSchemas, notes)
    : input.optionAwareness

  const optionDecision = input.optionDecision
    ? applySchemaToDecision(input.optionDecision, relevantSchemas, notes)
    : input.optionDecision

  return {
    fusedState,
    sensoryProtoMeanings: sensory,
    narrativeProtoMeanings: narrative,
    optionAwareness,
    optionDecision,
    influenceNotes: notes,
  }
}
