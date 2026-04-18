import type { PersonalLearningState } from '../learning/types'
import type { PlasticityState } from '../types/nodeStudio'
import type { CrystallizedThinkingResult } from './runtimeTypes'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import { runSignalRuntime } from '../signal/runSignalRuntime'

/**
 * Crystallized Thinking Runtime
 * API-independent approach focused on Dual Stream / Signal / ProtoMeaning / Option / Somatic.
 * This mode does NOT use provider selection for core decision-making.
 */

export type CrystallizedThinkingRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  personalLearning: PersonalLearningState
}

/**
 * Run the Crystallized Thinking runtime.
 * Uses dual stream architecture, signal dynamics, proto meanings, and option awareness.
 * Provider selection does NOT affect the core runtime logic.
 */
export const runCrystallizedThinkingRuntime = ({
  text,
  plasticity,
  personalLearning,
}: CrystallizedThinkingRuntimeInput): CrystallizedThinkingResult => {
  // Run chunked pipeline with dual stream and signal processing
  const chunkedResult = runChunkedNodePipeline(
    text,
    plasticity,
    0.5, // threshold base
    0,   // turn number
    undefined, // prior
    undefined, // previous cues
    0,   // previous turn
    undefined, // previous micro signal dimensions
    personalLearning.somaticMarkers,
  )

  // Run signal-centered runtime
  const signalResult = runSignalRuntime(text, {
    optionAwareness: chunkedResult.optionAwareness,
    optionDecision: chunkedResult.optionDecision,
    optionUtteranceHints: chunkedResult.optionUtteranceHints,
    somaticInfluence: chunkedResult.somaticInfluence,
    fusedState: chunkedResult.dualStream.fusedState,
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
  })

  return {
    implementationMode: 'crystallized_thinking',
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
    fusedState: chunkedResult.dualStream.fusedState,
    signalPackets: chunkedResult.dualStream.signalPackets,
    protoMeanings: {
      sensory: chunkedResult.sensoryProtoMeanings,
      narrative: chunkedResult.narrativeProtoMeanings,
    },
    optionAwareness: chunkedResult.optionAwareness,
    optionDecision: chunkedResult.optionDecision,
    somaticInfluence: chunkedResult.somaticInfluence,
    utterance: signalResult.utterance,
    dualStreamResult: chunkedResult.dualStream,
    chunkedResult,
    signalResult,
  }
}
