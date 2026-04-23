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
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { EventBoundary } from '../boundary/boundaryTypes'
import type { ConfidenceState } from '../meta/computeInterpretationConfidence'
import type { UncertaintyState } from '../predictive/uncertaintyTypes'
import type { ReplaySummary } from '../replay/runIdleReplay'
import type { FacadeView, FacadeViewTranslation } from '../core/facadeRuntime'
import type { PresentationBiasProfile } from '../core/facadePresentation'

/**
 * UI mode: observe (research) vs experience (conversation)
 */
export type AppMode = 'observe' | 'experience'
export type ObservationSource = AppMode

/**
 * Implementation mode: which architectural approach to use
 * - llm_mode: API-driven, provider-based, character/dialogue focused
 * - crystallized_thinking: API-independent, Dual Stream/Signal/ProtoMeaning core
 */
export type ImplementationMode = 'llm_mode' | 'crystallized_thinking'

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
  // Session continuity (Phase 1) - crystallized_thinking only
  nextBrainState?: SessionBrainState
  // Phase 2: Boundary / Confidence / Uncertainty / Replay - crystallized_thinking only
  eventBoundary?: EventBoundary
  confidenceState?: ConfidenceState
  uncertaintyState?: UncertaintyState
  replaySummary?: ReplaySummary
  updatedTrunk?: import('../core/coreTypes').SharedTrunkState
  promotionCandidates?: import('../core/coreTypes').PromotionCandidate[]
  guardianReviewRequests?: import('../core/guardian/guardianTypes').GuardianReviewRequest[]
  guardianReviewResults?: import('../core/guardian/guardianTypes').GuardianReviewResult[]
  guardianPolicy?: import('../core/guardian/guardianTypes').GuardianPolicy
  aiSenseiConfig?: import('../core/guardian/aiSensei').AiSenseiConfig
  humanReviewSummaries?: import('../core/guardian/humanReview/humanReviewTypes').HumanReviewSummary[]
  humanReviewRecords?: import('../core/guardian/humanReview/humanReviewTypes').HumanReviewRecord[]
  facadeView?: FacadeView
  rawFacadeView?: FacadeView
  facadeViewTranslation?: FacadeViewTranslation
  presentationBiasProfile?: PresentationBiasProfile
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
  // Phase 2 - crystallized_thinking only
  eventBoundary?: EventBoundary
  confidenceState?: ConfidenceState
  uncertaintyState?: UncertaintyState
  replaySummary?: ReplaySummary
  updatedTrunk?: import('../core/coreTypes').SharedTrunkState
  promotionCandidates?: import('../core/coreTypes').PromotionCandidate[]
  guardianReviewRequests?: import('../core/guardian/guardianTypes').GuardianReviewRequest[]
  guardianReviewResults?: import('../core/guardian/guardianTypes').GuardianReviewResult[]
  guardianPolicy?: import('../core/guardian/guardianTypes').GuardianPolicy
  aiSenseiConfig?: import('../core/guardian/aiSensei').AiSenseiConfig
  humanReviewSummaries?: import('../core/guardian/humanReview/humanReviewTypes').HumanReviewSummary[]
  humanReviewRecords?: import('../core/guardian/humanReview/humanReviewTypes').HumanReviewRecord[]
  facadeView?: FacadeView
  rawFacadeView?: FacadeView
  facadeViewTranslation?: FacadeViewTranslation
  presentationBiasProfile?: PresentationBiasProfile
}
