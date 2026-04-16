import type { SignalRuntimeResult } from '../signal/types'
import type { LearningLayers } from '../learning/types'
import type { InfoEntry, InfoLayer } from '../knowledge/types'
import type { ChunkedNodePipelineResult } from './runChunkedNodePipeline'
import { runSignalRuntime } from '../signal/runSignalRuntime'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import { updateSessionLearning } from '../learning/sessionLearning'
import { updatePersonalLearning } from '../learning/personalLearning'
import { updateGlobalCandidates } from '../learning/globalCandidateLearning'
import { selectInfoCandidates } from '../knowledge/selectInfoCandidates'
import { updateInfoLayer } from '../knowledge/updateInfoLayer'

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
 */
export const createSignalObservation = (
  input: SignalObservationInput,
): SignalObservationResult => {
  const { text, learning, infoLayer, useInfoLayer = false } = input

  // ── Signal Runtime ─────────────────────────────────────────────
  const runtimeResult = runSignalRuntime(text)
  const chunkedResult = runChunkedNodePipeline(text)
  const firedKeys = runtimeResult.pathwayKeys

  // ── Session Update ─────────────────────────────────────────────
  const nextSession = updateSessionLearning(learning.session, firedKeys)

  // ── Personal Update ────────────────────────────────────────────
  const nextPersonal = updatePersonalLearning(learning.personal, firedKeys)

  // ── Global Candidate Update ────────────────────────────────────
  const nextGlobalCandidates = updateGlobalCandidates(
    learning.globalCandidates,
    firedKeys,
    nextSession.pathwayStrengths,
    nextSession.sessionId,
  )

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
