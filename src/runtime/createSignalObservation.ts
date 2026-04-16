import type { SignalRuntimeResult } from '../intelligence/signal/types'
import type { LearningLayers } from '../intelligence/learning/types'
import type { InfoEntry, InfoLayer } from '../intelligence/knowledge/types'
import type { ChunkedNodePipelineResult } from './runChunkedNodePipeline'
import { runSignalRuntime } from '../intelligence/signal/runSignalRuntime'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import { updateSessionLearning } from '../intelligence/learning/sessionLearning'
import { updatePersonalLearning } from '../intelligence/learning/personalLearning'
import { updateGlobalCandidates } from '../intelligence/learning/globalCandidateLearning'
import { selectInfoCandidates } from '../intelligence/knowledge/selectInfoCandidates'
import { updateInfoLayer } from '../intelligence/knowledge/updateInfoLayer'
import { updateSomaticMarkers } from '../intelligence/somatic'
import type { SomaticMarker } from '../intelligence/somatic/types'

export type SignalObservationInput = {
  /** Raw input text (外刺激) */
  text: string
  /** Current three-layer learning state */
  learning: LearningLayers
  /** Current info layer */
  infoLayer: InfoLayer
  /**
   * Whether to access the info layer this turn.
   * Pass `true` only when contextual knowledge retrieval is warranted (必要時のみ).
   */
  useInfoLayer?: boolean
}

export type SignalObservationResult = {
  /** Full signal runtime result (utterance + all intermediate states) */
  runtimeResult: SignalRuntimeResult
  /** Chunk→feature→node runtime result for observe/debug integration */
  chunkedResult: ChunkedNodePipelineResult
  /** Updated three-layer learning state (session + personal + globalCandidates) */
  learning: LearningLayers
  /** Updated info layer (access counts incremented if useInfoLayer was true) */
  infoLayer: InfoLayer
  /** Info entries selected this turn (empty if useInfoLayer was false) */
  selectedInfoEntries: InfoEntry[]
}

/**
 * Map an utterance mode to a somatic decision shape.
 */
const mapDecisionShape = (
  utteranceMode: string,
  replyIntent?: string,
  shouldOfferStep?: boolean,
): SomaticMarker['decisionShape'] => {
  const stance = utteranceMode === 'boundary'
    ? 'hold'
    : utteranceMode === 'resonant'
      ? 'open_reflect'
      : utteranceMode === 'reflective'
        ? 'soft_answer'
        : 'answer'
  return {
    stance,
    shouldAnswerQuestion: replyIntent?.includes('answer') ?? false,
    shouldOfferStep: shouldOfferStep ?? false,
    shouldStayOpen: utteranceMode === 'resonant' || utteranceMode === 'receptive',
  }
}

/**
 * Run the full Signal-Centered Crystallization Runtime v1 flow.
 *
 * This is the primary entry point for Observe / Experience mode.
 *
 * Flow:
 *   外刺激
 *   → Signal Runtime (stimulus → signal activation → self/boundary loop
 *                     → field → bindings → proto-meanings → decision
 *                     → lexical candidates → phrase binding → sentence plan → utterance)
 *   → Session Update
 *   → Personal Update
 *   → Global Candidate Update
 *   → Info Layer Update (必要時のみ)
 *   → Somatic Marker Update (ISR v2.5)
 */
export const createSignalObservation = (
  input: SignalObservationInput,
): SignalObservationResult => {
  const { text, learning, infoLayer, useInfoLayer = false } = input

  // ── Signal Runtime ─────────────────────────────────────────────
  const runtimeResult = runSignalRuntime(text)
  const chunkedResult = runChunkedNodePipeline(
    text,
    undefined,
    0.5,
    0,
    undefined,
    undefined,
    0,
    undefined,
    learning.personal.somaticMarkers,
  )
  const firedKeys = runtimeResult.pathwayKeys

  // ── Session Update ─────────────────────────────────────────────
  const nextSession = updateSessionLearning(learning.session, firedKeys)

  // ── Personal Update ────────────────────────────────────────────
  let nextPersonal = updatePersonalLearning(learning.personal, firedKeys)

  // ── Global Candidate Update ────────────────────────────────────
  const nextGlobalCandidates = updateGlobalCandidates(
    learning.globalCandidates,
    firedKeys,
    nextSession.pathwayStrengths,
    nextSession.sessionId,
  )

  // ── ISR v2.5: Somatic Marker Update ───────────────────────────
  if (chunkedResult.somaticSignature) {
    const decisionShape = mapDecisionShape(
      runtimeResult.decision.utteranceMode,
      runtimeResult.decision.replyIntent,
      runtimeResult.decision.shouldOfferStep,
    )
    const neutralOutcome = { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 }
    const updatedMarkers = updateSomaticMarkers(
      nextPersonal.somaticMarkers ?? [],
      chunkedResult.somaticSignature,
      decisionShape,
      neutralOutcome,
      Date.now(),
    )
    nextPersonal = { ...nextPersonal, somaticMarkers: updatedMarkers }
  }

  const nextLearning: LearningLayers = {
    session: nextSession,
    personal: nextPersonal,
    globalCandidates: nextGlobalCandidates,
  }

  // ── Info Layer Update (必要時のみ) ─────────────────────────────
  let nextInfoLayer = infoLayer
  let selectedInfoEntries: InfoEntry[] = []

  if (useInfoLayer) {
    selectedInfoEntries = selectInfoCandidates(infoLayer, runtimeResult.signals)
    const usedKeys = selectedInfoEntries.map((e) => e.key)
    nextInfoLayer = updateInfoLayer(infoLayer, usedKeys)
  }

  return {
    runtimeResult,
    chunkedResult,
    learning: nextLearning,
    infoLayer: nextInfoLayer,
    selectedInfoEntries,
  }
}
