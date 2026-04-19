import type { PersonalLearningState } from '../learning/types'
import type { PlasticityState } from '../types/nodeStudio'
import type { CrystallizedThinkingResult } from './runtimeTypes'
import type { SessionBrainState } from '../brain/sessionBrainState'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import { runSignalRuntime } from '../signal/runSignalRuntime'
import { deriveUtteranceIntent } from '../utterance/deriveUtteranceIntent'
import { deriveUtteranceShape } from '../utterance/deriveUtteranceShape'
import { deriveLexicalPulls } from '../utterance/deriveLexicalPulls'
import { buildCrystallizedSentencePlan } from '../utterance/buildCrystallizedSentencePlan'
import { renderCrystallizedReply } from '../utterance/renderCrystallizedReply'
import { buildPreconditionFilter } from '../precondition/buildPreconditionFilter'
import { applyPreconditionToFusedState } from '../precondition/applyPreconditionToFusedState'
import { applyPreconditionToUtterance } from '../precondition/applyPreconditionToUtterance'
import { getPersonaWeightVector } from '../persona/getPersonaWeightVector'
import { applyPersonaToProtoMeanings } from '../persona/applyPersonaToProtoMeanings'
import { applyPersonaToOptionAwareness } from '../persona/applyPersonaToOptionAwareness'
import { applyPersonaToUtterance } from '../persona/applyPersonaToUtterance'
import { createInitialBrainState } from '../brain/createInitialBrainState'
import { updateBrainState } from '../brain/updateBrainState'

/**
 * Crystallized Thinking Runtime
 * API-independent approach focused on Dual Stream / Signal / ProtoMeaning / Option / Somatic.
 * This mode does NOT use provider selection for core decision-making.
 */

export type CrystallizedThinkingRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  personalLearning: PersonalLearningState
  personaId?: string // Pass 3: Optional persona selection
  brainState?: SessionBrainState // Phase 1: Session continuity
}

/**
 * Run the Crystallized Thinking runtime.
 * Uses dual stream architecture, signal dynamics, proto meanings, and option awareness.
 * Provider selection does NOT affect the core runtime logic.
 *
 * Pass 2: Adds utterance layer generation from internal state.
 * Pass 3: Adds precondition filter (Home/Existence/Belief) and persona weighting.
 * Phase 1: Adds session brain state continuity across turns.
 */
export const runCrystallizedThinkingRuntime = ({
  text,
  plasticity,
  personalLearning,
  personaId,
  brainState: inputBrainState,
}: CrystallizedThinkingRuntimeInput): CrystallizedThinkingResult => {
  // ===== Phase 1: Initialize or use existing brain state =====
  const brainState = inputBrainState ?? createInitialBrainState()

  // ===== Pass 3: Precondition & Persona Layers =====

  // 1. Build precondition filter (Home/Existence/Belief)
  const preconditionFilter = buildPreconditionFilter()

  // 2. Get persona weight vector
  const personaWeightVector = getPersonaWeightVector(personaId)

  // Run chunked pipeline with dual stream and signal processing
  // Phase 1: Pass session state instead of fixed values
  const chunkedResult = runChunkedNodePipeline(
    text,
    plasticity,
    brainState.recentActivityAverage, // Use session state instead of 0.5
    brainState.turnCount,              // Use session turn count instead of 0
    brainState.temporalStates,         // Use session temporal states instead of undefined
    personalLearning.pathwayStrengths, // Use pathway strengths from personal learning
    brainState.afterglow,              // Use session afterglow instead of 0
    brainState.predictionState,        // Use session prediction state instead of undefined
    personalLearning.somaticMarkers,
  )

  // ===== Pass 3: Apply Persona to proto meanings =====

  // Apply persona to proto meanings
  const personaModulatedSensory = applyPersonaToProtoMeanings(
    chunkedResult.sensoryProtoMeanings,
    personaWeightVector,
  )
  const personaModulatedNarrative = applyPersonaToProtoMeanings(
    chunkedResult.narrativeProtoMeanings,
    personaWeightVector,
  )

  // Apply persona to option awareness
  const personaModulatedOptions = applyPersonaToOptionAwareness(
    chunkedResult.optionAwareness,
    personaWeightVector,
  )

  // ===== Pass 3: Apply Precondition to fused state =====

  const preconditionModulatedFusedState = applyPreconditionToFusedState(
    chunkedResult.dualStream.fusedState,
    preconditionFilter,
  )

  // Run signal-centered runtime with modulated state
  const signalResult = runSignalRuntime(text, {
    optionAwareness: personaModulatedOptions,
    optionDecision: chunkedResult.optionDecision,
    optionUtteranceHints: chunkedResult.optionUtteranceHints,
    somaticInfluence: chunkedResult.somaticInfluence,
    fusedState: preconditionModulatedFusedState,
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
  })

  // ===== Utterance Layer Generation (Pass 2) =====

  // 1. Derive utterance intent from internal state (with persona-modulated meanings)
  const baseUtteranceIntent = deriveUtteranceIntent({
    fusedState: preconditionModulatedFusedState,
    sensoryProtoMeanings: personaModulatedSensory,
    narrativeProtoMeanings: personaModulatedNarrative,
    optionAwareness: personaModulatedOptions,
    somaticInfluence: chunkedResult.somaticInfluence,
    currentDecision: chunkedResult.optionDecision,
  })

  // ===== Pass 3: Apply Precondition and Persona to utterance intent =====

  const preconditionModulatedIntent = applyPreconditionToUtterance(
    baseUtteranceIntent,
    preconditionFilter,
  )
  const utteranceIntent = applyPersonaToUtterance(
    preconditionModulatedIntent,
    personaWeightVector,
  )

  // 2. Derive utterance shape (with modulated meanings)
  const utteranceShape = deriveUtteranceShape({
    utteranceIntent,
    optionAwareness: personaModulatedOptions,
    narrativeProtoMeanings: personaModulatedNarrative,
    sensoryProtoMeanings: personaModulatedSensory,
  })

  // 3. Derive lexical pulls (with modulated state)
  const lexicalPulls = deriveLexicalPulls({
    fusedState: preconditionModulatedFusedState,
    sensoryProtoMeanings: personaModulatedSensory,
    narrativeProtoMeanings: personaModulatedNarrative,
    optionAwareness: personaModulatedOptions,
  })

  // 4. Build sentence plan (with modulated meanings)
  const crystallizedSentencePlan = buildCrystallizedSentencePlan({
    utteranceIntent,
    utteranceShape,
    lexicalPulls,
    sensoryProtoMeanings: personaModulatedSensory,
    narrativeProtoMeanings: personaModulatedNarrative,
    optionAwareness: personaModulatedOptions,
    currentDecision: chunkedResult.optionDecision,
  })

  // 5. Render final crystallized reply
  const finalCrystallizedReply = renderCrystallizedReply({
    sentencePlan: crystallizedSentencePlan,
    utteranceIntent,
    lexicalPulls,
  })

  // ===== Phase 1: Update brain state for next turn =====
  const nextBrainState = updateBrainState(brainState, chunkedResult)

  return {
    implementationMode: 'crystallized_thinking',
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
    fusedState: preconditionModulatedFusedState, // Pass 3: Use modulated fused state
    signalPackets: chunkedResult.dualStream.signalPackets,
    protoMeanings: {
      sensory: personaModulatedSensory, // Pass 3: Use persona-modulated meanings
      narrative: personaModulatedNarrative, // Pass 3: Use persona-modulated meanings
    },
    optionAwareness: personaModulatedOptions, // Pass 3: Use persona-modulated options
    optionDecision: chunkedResult.optionDecision,
    somaticInfluence: chunkedResult.somaticInfluence,
    utterance: signalResult.utterance,
    dualStreamResult: chunkedResult.dualStream,
    chunkedResult,
    signalResult,
    // Utterance layer (Pass 2)
    utteranceIntent,
    utteranceShape,
    lexicalPulls,
    crystallizedSentencePlan,
    finalCrystallizedReply,
    // Precondition & Persona layers (Pass 3)
    preconditionFilter,
    personaWeightVector,
    // Session continuity (Phase 1)
    nextBrainState,
  }
}
