import type { PersonalLearningState } from '../learning/types'
import type { ApiProviderId } from '../types/apiProvider'
import type { ExperienceMessage, ObservationRecord, RuntimeMode, ImplementationMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import type { SessionBrainState } from '../brain/sessionBrainState'
import { runMainRuntime } from './runMainRuntime'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'
import { buildRevisionEntry } from '../revision/buildRevisionEntry'

/**
 * Observation builder for UI flows.
 * The page supplies observation metadata and input; runtime route selection stays
 * behind `runMainRuntime`, and the result comes back as a single observation record.
 *
 * Phase 1: Supports brain state input and returns nextBrainState for session continuity.
 */
export type CreateObservationRecordInput = {
  type: ObservationRecord['type']
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  runtimeMode: RuntimeMode
  implementationMode: ImplementationMode
  personalLearning: PersonalLearningState
  brainState?: SessionBrainState // Phase 1: Session continuity
}

export const createObservationId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  const highResolutionTime = typeof performance !== 'undefined' ? performance.now().toFixed(5) : '0'
  return `${prefix}_${Date.now()}_${highResolutionTime}_${Math.random().toString(36).slice(2, 8)}`
}

export const formatObservationTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const createObservationRecord = async ({
  type,
  text,
  plasticity,
  provider,
  runtimeMode,
  implementationMode,
  personalLearning,
  brainState,
}: CreateObservationRecordInput): Promise<ObservationRecord> => {
  const timestamp = new Date().toISOString()
  const runtimeResult = await runMainRuntime({
    text,
    plasticity,
    provider,
    implementationMode,
    personalLearning,
    brainState,
  })

  // Convert RuntimeResult to ObservationRecord format
  if (runtimeResult.implementationMode === 'jibun_kaigi_api') {
    return {
      id: createObservationId(type),
      type,
      runtimeMode,
      implementationMode: 'jibun_kaigi_api',
      text,
      timestamp,
      time: formatObservationTime(timestamp),
      pipelineResult: runtimeResult.pipelineResult,
      studioView: runtimeResult.studioView,
      revisionEntry: runtimeResult.revisionEntry,
      assistantReply: runtimeResult.assistantReply,
    }
  }

  // Crystallized thinking mode
  // Need to provide backward-compatible fields for UI
  const legacySnapshot = runLegacyNodePipeline(text, plasticity)
  const revisionEntry = buildRevisionEntry(legacySnapshot.pipelineResult, legacySnapshot.studioView)

  return {
    id: createObservationId(type),
    type,
    runtimeMode,
    implementationMode: 'crystallized_thinking',
    text,
    timestamp,
    time: formatObservationTime(timestamp),
    pipelineResult: legacySnapshot.pipelineResult,
    studioView: legacySnapshot.studioView,
    revisionEntry,
    assistantReply: runtimeResult.finalCrystallizedReply || runtimeResult.utterance,
    signalResult: runtimeResult.signalResult,
    chunkedResult: runtimeResult.chunkedResult,
    dualStreamResult: runtimeResult.dualStreamResult,
    somaticSignature: runtimeResult.chunkedResult.somaticSignature,
    somaticInfluence: runtimeResult.somaticInfluence,
    relevantSomaticMarkers: runtimeResult.chunkedResult.relevantSomaticMarkers,
    // Utterance layer (Pass 2)
    utteranceIntent: runtimeResult.utteranceIntent,
    utteranceShape: runtimeResult.utteranceShape,
    lexicalPulls: runtimeResult.lexicalPulls,
    crystallizedSentencePlan: runtimeResult.crystallizedSentencePlan,
    finalCrystallizedReply: runtimeResult.finalCrystallizedReply,
    previousUtterance: runtimeResult.utterance,  // Keep for comparison
    // Session continuity (Phase 1)
    nextBrainState: runtimeResult.nextBrainState,
    // Phase 2: Boundary / Confidence / Uncertainty / Replay
    eventBoundary: runtimeResult.eventBoundary,
    confidenceState: runtimeResult.confidenceState,
    uncertaintyState: runtimeResult.uncertaintyState,
    replaySummary: runtimeResult.replaySummary,
    guardianReviewRequests: runtimeResult.guardianReviewRequests,
    guardianReviewResults: runtimeResult.guardianReviewResults,
    guardianPolicy: runtimeResult.guardianPolicy,
    aiSenseiConfig: runtimeResult.aiSenseiConfig,
    humanReviewSummaries: runtimeResult.humanReviewSummaries,
    humanReviewRecords: runtimeResult.humanReviewRecords,
  }
}

export const createExperienceTurnMessages = (record: ObservationRecord): ExperienceMessage[] => {
  const turnTimestamp = record.timestamp

  return [
    {
      id: createObservationId('exp_user'),
      observationId: record.id,
      role: 'user',
      text: record.text,
      timestamp: turnTimestamp,
      runtimeMode: record.runtimeMode,
      implementationMode: record.implementationMode,
      pipelineResult: record.pipelineResult,
      studioView: record.studioView,
      revisionEntry: record.revisionEntry,
      signalResult: record.signalResult,
      chunkedResult: record.chunkedResult,
      dualStreamResult: record.dualStreamResult,
      somaticSignature: record.somaticSignature,
      somaticInfluence: record.somaticInfluence,
      relevantSomaticMarkers: record.relevantSomaticMarkers,
      utteranceIntent: record.utteranceIntent,
      utteranceShape: record.utteranceShape,
      lexicalPulls: record.lexicalPulls,
      crystallizedSentencePlan: record.crystallizedSentencePlan,
      finalCrystallizedReply: record.finalCrystallizedReply,
      previousUtterance: record.previousUtterance,
      // Phase 2
      eventBoundary: record.eventBoundary,
      confidenceState: record.confidenceState,
      uncertaintyState: record.uncertaintyState,
      replaySummary: record.replaySummary,
      guardianReviewRequests: record.guardianReviewRequests,
      guardianReviewResults: record.guardianReviewResults,
      guardianPolicy: record.guardianPolicy,
      aiSenseiConfig: record.aiSenseiConfig,
      humanReviewSummaries: record.humanReviewSummaries,
      humanReviewRecords: record.humanReviewRecords,
    },
    {
      id: createObservationId('exp_assistant'),
      observationId: record.id,
      role: 'assistant',
      text: record.assistantReply,
      timestamp: turnTimestamp,
      runtimeMode: record.runtimeMode,
      implementationMode: record.implementationMode,
      pipelineResult: record.pipelineResult,
      studioView: record.studioView,
      revisionEntry: record.revisionEntry,
      signalResult: record.signalResult,
      chunkedResult: record.chunkedResult,
      dualStreamResult: record.dualStreamResult,
      somaticSignature: record.somaticSignature,
      somaticInfluence: record.somaticInfluence,
      relevantSomaticMarkers: record.relevantSomaticMarkers,
      utteranceIntent: record.utteranceIntent,
      utteranceShape: record.utteranceShape,
      lexicalPulls: record.lexicalPulls,
      crystallizedSentencePlan: record.crystallizedSentencePlan,
      finalCrystallizedReply: record.finalCrystallizedReply,
      previousUtterance: record.previousUtterance,
      // Phase 2
      eventBoundary: record.eventBoundary,
      confidenceState: record.confidenceState,
      uncertaintyState: record.uncertaintyState,
      replaySummary: record.replaySummary,
      guardianReviewRequests: record.guardianReviewRequests,
      guardianReviewResults: record.guardianReviewResults,
      guardianPolicy: record.guardianPolicy,
      aiSenseiConfig: record.aiSenseiConfig,
      humanReviewSummaries: record.humanReviewSummaries,
      humanReviewRecords: record.humanReviewRecords,
    },
  ]
}
