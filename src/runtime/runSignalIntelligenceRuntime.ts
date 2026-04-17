import type { SignalRuntimeResult } from '../signal/types'
import { runSignalRuntime } from '../signal/runSignalRuntime'
import { buildSignalRevisionEntry } from '../signal/buildSignalRevisionEntry'
import type { PersonalLearningState } from '../learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { RuntimeMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import type { DualStreamRuntimeResult } from './runDualStreamRuntime'

/**
 * Signal-intelligence route payload.
 * Keeps the legacy backbone visible to studio/revision while attaching
 * signal-centered outputs when that route is active.
 */
export type SignalIntelligenceRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  runtimeMode: RuntimeMode
  personalLearning: PersonalLearningState
}

export type SignalIntelligenceRuntimeResult = {
  runtimeMode: RuntimeMode
  pipelineResult: ReturnType<typeof runLegacyNodePipeline>['pipelineResult']
  studioView: ReturnType<typeof runLegacyNodePipeline>['studioView']
  revisionEntry: ReturnType<typeof runLegacyNodePipeline>['revisionEntry']
  assistantReply: string
  signalResult?: SignalRuntimeResult
  chunkedResult?: ReturnType<typeof runChunkedNodePipeline>
  dualStreamResult?: DualStreamRuntimeResult
  somaticSignature?: ReturnType<typeof runChunkedNodePipeline>['somaticSignature']
  somaticInfluence?: ReturnType<typeof runChunkedNodePipeline>['somaticInfluence']
  relevantSomaticMarkers?: ReturnType<typeof runChunkedNodePipeline>['relevantSomaticMarkers']
}

const runSignalCenteredRoute = (
  text: string,
  plasticity: PlasticityState | undefined,
  personalLearning: PersonalLearningState,
  legacySnapshot: ReturnType<typeof runLegacyNodePipeline>,
): SignalIntelligenceRuntimeResult => {
  const chunkedResult = runChunkedNodePipeline(
    text,
    plasticity,
    0.5,
    0,
    undefined,
    undefined,
    0,
    undefined,
    personalLearning.somaticMarkers,
  )
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
    runtimeMode: 'signal',
    pipelineResult: legacySnapshot.pipelineResult,
    studioView: legacySnapshot.studioView,
    revisionEntry: buildSignalRevisionEntry(signalResult),
    assistantReply: signalResult.utterance,
    signalResult,
    chunkedResult,
    dualStreamResult: chunkedResult.dualStream,
    somaticSignature: chunkedResult.somaticSignature,
    somaticInfluence: chunkedResult.somaticInfluence,
    relevantSomaticMarkers: chunkedResult.relevantSomaticMarkers,
  }
}

const runSignalAssistedNodeRoute = async ({
  text,
  plasticity,
  provider,
  personalLearning,
  legacySnapshot,
}: Omit<SignalIntelligenceRuntimeInput, 'runtimeMode'> & {
  legacySnapshot: ReturnType<typeof runLegacyNodePipeline>
}): Promise<SignalIntelligenceRuntimeResult> => {
  const chunkedResult = runChunkedNodePipeline(
    text,
    plasticity,
    0.5,
    0,
    undefined,
    undefined,
    0,
    undefined,
    personalLearning.somaticMarkers,
  )
  const assistantReply = await generateSurfaceReply({ provider, studioView: legacySnapshot.studioView })

  return {
    runtimeMode: 'node',
    pipelineResult: legacySnapshot.pipelineResult,
    studioView: legacySnapshot.studioView,
    revisionEntry: legacySnapshot.revisionEntry,
    assistantReply,
    chunkedResult,
    dualStreamResult: chunkedResult.dualStream,
    somaticSignature: chunkedResult.somaticSignature,
    somaticInfluence: chunkedResult.somaticInfluence,
    relevantSomaticMarkers: chunkedResult.relevantSomaticMarkers,
  }
}

/**
 * Signal-intelligence route.
 * - `runtimeMode: signal` runs the signal-centered runtime directly.
 * - `runtimeMode: node` preserves the legacy backbone while attaching signal-side preprocessing.
 */
export const runSignalIntelligenceRuntime = async ({
  text,
  plasticity,
  provider,
  runtimeMode,
  personalLearning,
}: SignalIntelligenceRuntimeInput): Promise<SignalIntelligenceRuntimeResult> => {
  const legacySnapshot = runLegacyNodePipeline(text, plasticity)

  if (runtimeMode === 'signal') {
    return runSignalCenteredRoute(text, plasticity, personalLearning, legacySnapshot)
  }

  return runSignalAssistedNodeRoute({
    text,
    plasticity,
    provider,
    personalLearning,
    legacySnapshot,
  })
}
