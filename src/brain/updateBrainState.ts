/**
 * Update Brain State
 * Derives the next turn's brain state from the current runtime result.
 *
 * Phase M2: Now includes precision control state persistence.
 * Phase M4: Now includes episodic trace and schema memory persistence.
 */

import type { SessionBrainState } from './sessionBrainState'
import type { ChunkedNodePipelineResult } from '../runtime/runChunkedNodePipeline'
import type { TemporalFeatureState } from '../signal/temporalTypes'
import type { PrecisionControl, UncertaintyState, PrecisionInfluenceNote } from './precisionTypes'
import type { EpisodicTrace, SchemaMemoryState, SchemaInfluenceNote } from '../memory/types'

/**
 * Builds the next temporal states map from active features.
 * This captures which features fired this turn and when.
 */
const buildNextTemporalStates = (
  chunkedResult: ChunkedNodePipelineResult,
  currentTurn: number,
): Map<string, TemporalFeatureState> => {
  const nextStates = new Map<string, TemporalFeatureState>()

  for (const feature of chunkedResult.chunkedStage.activeFeatures) {
    nextStates.set(feature.id, {
      id: feature.id,
      strength: feature.strength,
      lastFiredTurn: currentTurn,
      decayRate: 0.15, // Default decay rate
      refractoryUntilTurn: currentTurn + 1,
    })
  }

  return nextStates
}

/**
 * Calculates afterglow strength for the next turn.
 * Based on current turn's activity level and field intensity.
 * Range: 0-0.2 as specified in the requirements.
 */
const calculateAfterglowStrength = (
  chunkedResult: ChunkedNodePipelineResult,
  previousFieldIntensity: number,
): number => {
  const activeFeatureCount = chunkedResult.chunkedStage.activeFeatures.length
  const maxExpectedFeatures = 20 // Typical maximum
  const activityRatio = Math.min(activeFeatureCount / maxExpectedFeatures, 1.0)

  // Combine activity ratio with field intensity
  const rawAfterGlow = (activityRatio * 0.5 + previousFieldIntensity * 0.5)

  // Normalize to 0-0.2 range
  return Math.min(rawAfterGlow * 0.2, 0.2)
}

/**
 * Calculates recent activity average from the chunked result.
 */
const calculateRecentActivity = (chunkedResult: ChunkedNodePipelineResult): number => {
  const activeFeatureCount = chunkedResult.chunkedStage.activeFeatures.length
  const totalRawFeatures = chunkedResult.chunkedStage.rawFeatures.length

  if (totalRawFeatures === 0) return 0.5

  return Math.min(activeFeatureCount / totalRawFeatures, 1.0)
}

/**
 * Calculates field intensity from the chunked result.
 */
const calculateFieldIntensity = (chunkedResult: ChunkedNodePipelineResult): number => {
  // Use prediction modulation's field intensity boost if available
  if (chunkedResult.predictionModulationResult?.fieldIntensityBoost) {
    return Math.min(chunkedResult.predictionModulationResult.fieldIntensityBoost, 1.0)
  }

  // Fallback: use overall surprise or threshold
  if (chunkedResult.predictionModulationResult?.overallSurprise) {
    return chunkedResult.predictionModulationResult.overallSurprise
  }

  return chunkedResult.chunkedStage.threshold.current
}

/**
 * Updates brain state for the next turn based on the current runtime result.
 *
 * Phase M2: Accepts optional precision state that will be persisted for next turn.
 * Phase M4: Accepts optional memory state (episodic traces and schema memory).
 *
 * @param previousState The brain state from the previous turn
 * @param chunkedResult The runtime result from the current turn
 * @param precisionState Optional precision state from current turn
 * @param memoryState Optional memory state from current turn (Phase M4)
 * @returns Updated brain state for the next turn
 */
export const updateBrainState = (
  previousState: SessionBrainState,
  chunkedResult: ChunkedNodePipelineResult,
  precisionState?: {
    precisionControl: PrecisionControl
    uncertaintyState: UncertaintyState
    precisionNotes: PrecisionInfluenceNote[]
  },
  memoryState?: {
    episodicTraces: EpisodicTrace[]
    schemaMemory: SchemaMemoryState
    schemaInfluenceNotes: SchemaInfluenceNote[]
  },
): SessionBrainState => {
  const nextTurnCount = previousState.turnCount + 1

  // Build next temporal states from active features
  const nextTemporalStates = buildNextTemporalStates(chunkedResult, previousState.turnCount)

  // Calculate afterglow for next turn
  const nextAfterGlow = calculateAfterglowStrength(chunkedResult, previousState.recentFieldIntensity)

  // Calculate recent activity
  const nextRecentActivity = calculateRecentActivity(chunkedResult)

  // Calculate field intensity
  const nextFieldIntensity = calculateFieldIntensity(chunkedResult)

  // Extract micro-signal dimensions from dual stream result
  const nextMicroSignalDimensions = {
    fieldTone: chunkedResult.dualStream.microSignalState.fieldTone,
    activeCueCount: chunkedResult.dualStream.activeCues.length,
    fusedConfidence: chunkedResult.dualStream.fusedState.fusedConfidence,
  }

  // Phase M2: Blend precision control with previous (70% new, 30% old)
  let nextPrecisionControl: PrecisionControl | undefined
  let nextUncertaintyState: UncertaintyState | undefined
  let nextPrecisionNotes: PrecisionInfluenceNote[] | undefined

  if (precisionState) {
    // Precision control is blended (already done in derivePrecisionControl)
    nextPrecisionControl = precisionState.precisionControl

    // Uncertainty state is partially retained (30% old, 70% new)
    if (previousState.uncertaintyState) {
      nextUncertaintyState = {
        expectedness: (precisionState.uncertaintyState.expectedness * 0.7) + (previousState.uncertaintyState.expectedness * 0.3),
        novelty: (precisionState.uncertaintyState.novelty * 0.7) + (previousState.uncertaintyState.novelty * 0.3),
        ambiguity: (precisionState.uncertaintyState.ambiguity * 0.7) + (previousState.uncertaintyState.ambiguity * 0.3),
        volatilityEstimate: (precisionState.uncertaintyState.volatilityEstimate * 0.7) + (previousState.uncertaintyState.volatilityEstimate * 0.3),
        confidenceDrift: (precisionState.uncertaintyState.confidenceDrift * 0.7) + (previousState.uncertaintyState.confidenceDrift * 0.3),
      }
    } else {
      nextUncertaintyState = precisionState.uncertaintyState
    }

    // Precision notes are kept for Observe (only current turn)
    nextPrecisionNotes = precisionState.precisionNotes
  }

  return {
    ...previousState,
    turnCount: nextTurnCount,
    temporalStates: nextTemporalStates,
    predictionState: chunkedResult.nextPredictionState,
    afterglow: nextAfterGlow,
    recentFieldIntensity: nextFieldIntensity,
    recentActivityAverage: nextRecentActivity,
    microSignalDimensions: nextMicroSignalDimensions,
    // Phase M2: Precision state
    precisionControl: nextPrecisionControl,
    uncertaintyState: nextUncertaintyState,
    precisionNotes: nextPrecisionNotes,
    // Phase M4: Memory state
    episodicTraces: memoryState?.episodicTraces ?? previousState.episodicTraces ?? [],
    schemaMemory: memoryState?.schemaMemory ?? previousState.schemaMemory,
    schemaInfluenceNotes: memoryState?.schemaInfluenceNotes ?? previousState.schemaInfluenceNotes,
    // Episodic buffer, workspace, and interoception remain unchanged for Phase 1
    // These will be enhanced in future phases
  }
}
