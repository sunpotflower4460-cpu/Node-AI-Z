/**
 * Episodic Memory
 * Phase M4: Creates episodic traces from turn results.
 *
 * An episodic trace captures a single meaningful event, not yet consolidated
 * into long-term schema. High-salience or unresolved experiences remain episodic
 * until replay consolidation determines they form a recurring pattern.
 */

import type { EpisodicTrace } from './types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'
import type { SomaticInfluence } from '../somatic/types'

export type CreateEpisodicTraceInput = {
  /** User input text */
  inputText: string

  /** Sensory proto meanings from this turn */
  sensoryProtoMeanings: ProtoMeaning[]

  /** Narrative proto meanings from this turn */
  narrativeProtoMeanings: ProtoMeaning[]

  /** Option awareness state */
  optionAwareness?: OptionAwareness

  /** Somatic influence */
  somaticInfluence?: SomaticInfluence

  /** Surprise magnitude from prediction error (0.0 - 1.0) */
  surprise?: number

  /** Current turn number */
  currentTurn: number

  /** Micro-signal dimensions from fused state */
  microSignalDimensions?: {
    fieldTone: string
    fusedConfidence: number
  }
}

/**
 * Extracts dominant proto meaning IDs from sensory and narrative meanings.
 * Takes top meanings by activation strength.
 */
const extractDominantProtoMeanings = (
  sensory: ProtoMeaning[],
  narrative: ProtoMeaning[],
  maxCount = 5,
): string[] => {
  const allMeanings = [...sensory, ...narrative]

  // Sort by activation strength
  const sorted = allMeanings
    .filter((m) => m.activation > 0.3) // Only consider meaningful activations
    .sort((a, b) => b.activation - a.activation)
    .slice(0, maxCount)

  return sorted.map((m) => m.id)
}

/**
 * Extracts dominant texture tags from meanings and micro-signals.
 * Textures represent qualitative aspects like fragility, heaviness, resonance.
 */
const extractDominantTextures = (
  sensory: ProtoMeaning[],
  narrative: ProtoMeaning[],
  microSignalDimensions?: { fieldTone: string },
  maxCount = 3,
): string[] => {
  const textures: string[] = []

  // Add field tone as a texture
  if (microSignalDimensions?.fieldTone && microSignalDimensions.fieldTone !== 'neutral') {
    textures.push(microSignalDimensions.fieldTone)
  }

  // Extract texture hints from proto meaning labels
  const allMeanings = [...sensory, ...narrative]
  for (const meaning of allMeanings) {
    if (meaning.activation > 0.4) {
      // High activation meanings contribute their labels as textures
      const label = meaning.label.toLowerCase()
      if (label.includes('fragil')) textures.push('fragility')
      if (label.includes('heavy') || label.includes('weight')) textures.push('heaviness')
      if (label.includes('reson') || label.includes('echo')) textures.push('resonance')
      if (label.includes('gentle')) textures.push('gentle')
      if (label.includes('sharp') || label.includes('sudden')) textures.push('sharp')
      if (label.includes('loss') || label.includes('lack')) textures.push('loss')
      if (label.includes('change') || label.includes('shift')) textures.push('change')
      if (label.includes('uncertain')) textures.push('uncertainty')
    }
  }

  // Return unique textures, limited by maxCount
  return [...new Set(textures)].slice(0, maxCount)
}

/**
 * Extracts unresolved tension keys from option awareness.
 */
const extractUnresolvedTensions = (optionAwareness?: OptionAwareness): string[] => {
  if (!optionAwareness) return []

  const tensions: string[] = []

  // High ambivalence indicates unresolved tension
  if ((optionAwareness.ambivalence ?? 0) > 0.6) {
    tensions.push('high-ambivalence')
  }

  // Bridge need indicates unresolved integration
  if ((optionAwareness.bridgeNeed ?? 0) > 0.5) {
    tensions.push('bridge-needed')
  }

  // Multiple options with similar salience
  const detectedOptions = optionAwareness.detectedOptions || []
  if (detectedOptions.length > 1) {
    const topSalience = detectedOptions[0]?.salience ?? 0
    const hasCompetingOptions = detectedOptions.some(
      (opt, idx) => idx > 0 && Math.abs(opt.salience - topSalience) < 0.15
    )
    if (hasCompetingOptions) {
      tensions.push('competing-options')
    }
  }

  return tensions
}

/**
 * Computes salience score based on multiple factors.
 * Higher salience means this trace is more important to retain.
 */
const computeSalience = (input: CreateEpisodicTraceInput): number => {
  let salience = 0.0

  // Surprise contributes strongly to salience
  const surprise = input.surprise ?? 0.0
  salience += surprise * 0.4

  // Low confidence (high uncertainty) increases salience
  const confidence = input.microSignalDimensions?.fusedConfidence ?? 0.5
  const uncertaintyFactor = (1.0 - confidence)
  salience += uncertaintyFactor * 0.2

  // Unresolved tensions increase salience
  const unresolvedCount = extractUnresolvedTensions(input.optionAwareness).length
  salience += Math.min(unresolvedCount * 0.15, 0.3)

  // Somatic influence increases salience
  const somaticStrength = input.somaticInfluence?.influenceStrength ?? 0.0
  salience += somaticStrength * 0.2

  // Strong meanings increase salience
  const strongMeanings = [
    ...input.sensoryProtoMeanings,
    ...input.narrativeProtoMeanings,
  ].filter((m) => m.activation > 0.5)
  salience += Math.min(strongMeanings.length * 0.05, 0.2)

  // Clamp to [0.0, 1.0]
  return Math.min(Math.max(salience, 0.0), 1.0)
}

/**
 * Creates an episodic trace from the current turn's results.
 * This trace represents a single meaningful event that may later be
 * consolidated into a schema pattern through replay.
 */
export const createEpisodicTrace = (input: CreateEpisodicTraceInput): EpisodicTrace => {
  const dominantProtoMeaningIds = extractDominantProtoMeanings(
    input.sensoryProtoMeanings,
    input.narrativeProtoMeanings,
  )

  const dominantTextureTags = extractDominantTextures(
    input.sensoryProtoMeanings,
    input.narrativeProtoMeanings,
    input.microSignalDimensions,
  )

  const unresolvedTensionKeys = extractUnresolvedTensions(input.optionAwareness)

  const salience = computeSalience(input)

  // Generate unique trace ID
  const traceId = `trace_${input.currentTurn}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Summarize option state if present
  let optionSummary: string | undefined
  if (input.optionAwareness?.detectedOptions && input.optionAwareness.detectedOptions.length > 0) {
    const topOptions = input.optionAwareness.detectedOptions
      .slice(0, 3)
      .map((opt) => opt.label)
      .join(', ')
    optionSummary = `Options: ${topOptions}`
  }

  const trace: EpisodicTrace = {
    id: traceId,
    inputText: input.inputText,
    dominantProtoMeaningIds,
    dominantTextureTags,
    optionSummary,
    somaticSignatureKey: input.somaticInfluence?.signatureKey,
    surprise: input.surprise,
    unresolvedTensionKeys,
    createdAtTurn: input.currentTurn,
    createdAtTime: Date.now(),
    salience,
    replayCount: 0,
    consolidated: false,
  }

  return trace
}
