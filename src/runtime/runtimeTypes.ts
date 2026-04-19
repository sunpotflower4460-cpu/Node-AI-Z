import type { ImplementationMode } from '../types/experience'
import type { ApiProviderId } from '../types/apiProvider'
import type { NodePipelineResult, RevisionEntry, StudioViewModel } from '../types/nodeStudio'
import type { SignalRuntimeResult } from '../signal/types'
import type { ChunkedNodePipelineResult } from './runChunkedNodePipeline'
import type { DualStreamRuntimeResult } from './runDualStreamRuntime'
import type {
  UtteranceIntent,
  UtteranceShape,
  LexicalPulls,
  CrystallizedSentencePlan,
} from '../utterance/types'

/**
 * Base runtime result shared by both modes
 */
export type RuntimeResultBase = {
  implementationMode: ImplementationMode
}

/**
 * Jibun Kaigi API mode result
 * API-driven, provider-based approach with character/dialogue focus
 */
export type JibunKaigiApiResult = RuntimeResultBase & {
  implementationMode: 'jibun_kaigi_api'
  provider: ApiProviderId
  pipelineResult: NodePipelineResult
  studioView: StudioViewModel
  revisionEntry: RevisionEntry
  assistantReply: string
  apiRoute?: string
  messageContext?: unknown
}

/**
 * Crystallized Thinking mode result
 * API-independent approach focused on Dual Stream/Signal/ProtoMeaning
 */
export type CrystallizedThinkingResult = RuntimeResultBase & {
  implementationMode: 'crystallized_thinking'
  lexicalState: DualStreamRuntimeResult['lexicalState']
  microSignalState: DualStreamRuntimeResult['microSignalState']
  fusedState: DualStreamRuntimeResult['fusedState']
  signalPackets: DualStreamRuntimeResult['signalPackets']
  protoMeanings: {
    sensory: ChunkedNodePipelineResult['sensoryProtoMeanings']
    narrative: ChunkedNodePipelineResult['narrativeProtoMeanings']
  }
  optionAwareness?: ChunkedNodePipelineResult['optionAwareness']
  optionDecision?: ChunkedNodePipelineResult['optionDecision']
  somaticInfluence?: ChunkedNodePipelineResult['somaticInfluence']
  utterance: string
  dualStreamResult: DualStreamRuntimeResult
  chunkedResult: ChunkedNodePipelineResult
  signalResult?: SignalRuntimeResult
  // Utterance layer (Pass 2)
  utteranceIntent?: UtteranceIntent
  utteranceShape?: UtteranceShape
  lexicalPulls?: LexicalPulls
  crystallizedSentencePlan?: CrystallizedSentencePlan
  finalCrystallizedReply?: string
}

/**
 * Discriminated union of all runtime results
 */
export type RuntimeResult = JibunKaigiApiResult | CrystallizedThinkingResult
