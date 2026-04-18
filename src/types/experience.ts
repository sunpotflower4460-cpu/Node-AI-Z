import type { NodePipelineResult, RevisionEntry, StudioViewModel } from './nodeStudio'
import type { SignalRuntimeResult } from '../signal/types'
import type { ChunkedNodePipelineResult } from '../runtime/runChunkedNodePipeline'
import type { DualStreamRuntimeResult } from '../runtime/runDualStreamRuntime'
import type {
  UtteranceIntent,
  UtteranceShape,
  LexicalPulls,
  CrystallizedSentencePlan,
} from '../utterance/types'

/**
 * UI mode: observe (research) vs experience (conversation)
 */
export type AppMode = 'observe' | 'experience'
export type ObservationSource = AppMode

/**
 * Implementation mode: which architectural approach to use
 * - jibun_kaigi_api: API-driven, provider-based, character/dialogue focused
 * - crystallized_thinking: API-independent, Dual Stream/Signal/ProtoMeaning core
 */
export type ImplementationMode = 'jibun_kaigi_api' | 'crystallized_thinking'

/**
 * Legacy runtime mode (to be deprecated in favor of ImplementationMode)
 */
export type RuntimeMode = 'node' | 'signal'

export type ObservationRecord = {
  id: string
  type: ObservationSource
  runtimeMode: RuntimeMode
  implementationMode?: ImplementationMode
  text: string
  timestamp: string
  time: string
  pipelineResult: NodePipelineResult
  studioView: StudioViewModel
  revisionEntry: RevisionEntry
  assistantReply: string
  signalResult?: SignalRuntimeResult
  chunkedResult?: ChunkedNodePipelineResult
  dualStreamResult?: DualStreamRuntimeResult
  somaticSignature?: import('../somatic/types').SomaticSignature
  somaticInfluence?: import('../somatic/types').SomaticInfluence
  relevantSomaticMarkers?: import('../somatic/types').SomaticMarker[]
  // Utterance layer (Pass 2) - crystallized_thinking only
  utteranceIntent?: UtteranceIntent
  utteranceShape?: UtteranceShape
  lexicalPulls?: LexicalPulls
  crystallizedSentencePlan?: CrystallizedSentencePlan
  finalCrystallizedReply?: string
  previousUtterance?: string  // For comparison
}

export type ExperienceMessage = {
  id: string
  observationId: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  runtimeMode?: RuntimeMode
  implementationMode?: ImplementationMode
  pipelineResult?: NodePipelineResult
  studioView?: StudioViewModel
  revisionEntry?: RevisionEntry
  signalResult?: SignalRuntimeResult
  chunkedResult?: ChunkedNodePipelineResult
  dualStreamResult?: DualStreamRuntimeResult
  somaticSignature?: import('../somatic/types').SomaticSignature
  somaticInfluence?: import('../somatic/types').SomaticInfluence
  relevantSomaticMarkers?: import('../somatic/types').SomaticMarker[]
  // Utterance layer (Pass 2) - crystallized_thinking only
  utteranceIntent?: UtteranceIntent
  utteranceShape?: UtteranceShape
  lexicalPulls?: LexicalPulls
  crystallizedSentencePlan?: CrystallizedSentencePlan
  finalCrystallizedReply?: string
  previousUtterance?: string
}
