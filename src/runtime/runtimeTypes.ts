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
import type { PreconditionFilter } from '../precondition/types'
import type { PersonaWeightVector } from '../persona/types'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { EventBoundary } from '../boundary/boundaryTypes'
import type { ConfidenceState } from '../meta/computeInterpretationConfidence'
import type { UncertaintyState } from '../predictive/uncertaintyTypes'
import type { PrecisionControl, PrecisionInfluenceNote } from '../brain/precisionTypes'
import type { PrecisionWeightedPredictionError } from '../brain/applyPrecisionToPredictionError'
import type { SignalDynamicsAdjustment } from '../brain/applyPrecisionToSignalDynamics'
import type { ReplaySummary } from '../replay/runIdleReplay'
import type { InteroceptiveState } from '../interoception/interoceptiveState'
import type { CoalitionState } from '../coalition/mergeCoalitionState'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { InternalActionPolicy } from '../action/buildActiveSensingPolicy'
import type { WorkspaceGateResult } from '../brain/workspaceTypes'

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
  // Precondition & Persona layers (Pass 3)
  preconditionFilter?: PreconditionFilter
  personaWeightVector?: PersonaWeightVector
  // Session continuity (Phase 1)
  nextBrainState?: SessionBrainState
  // Phase 2: Boundary / Confidence / Uncertainty / Replay
  eventBoundary?: EventBoundary
  confidenceState?: ConfidenceState
  uncertaintyState?: UncertaintyState
  replaySummary?: ReplaySummary
  // Phase M2: Precision / Uncertainty Control
  precisionControl?: PrecisionControl
  m2UncertaintyState?: import('../brain/precisionTypes').UncertaintyState
  weightedPredictionError?: PrecisionWeightedPredictionError
  signalDynamicsAdjustment?: SignalDynamicsAdjustment
  precisionNotes?: PrecisionInfluenceNote[]
  // Phase 3: Interoception / Coalition / Workspace / Action
  interoceptiveState?: InteroceptiveState
  coalitionState?: CoalitionState
  workspaceState?: WorkspaceState
  internalActionPolicy?: InternalActionPolicy
  // Phase M3: Workspace Gate
  workspaceGateResult?: WorkspaceGateResult
}

/**
 * Discriminated union of all runtime results
 */
export type RuntimeResult = JibunKaigiApiResult | CrystallizedThinkingResult
