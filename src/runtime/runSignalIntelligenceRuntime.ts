import type { SignalRuntimeResult } from '../intelligence/signal/types'
import { runSignalRuntime } from '../intelligence/signal/runSignalRuntime'
import { buildSignalRevisionEntry } from '../intelligence/signal/buildSignalRevisionEntry'
import type { PersonalLearningState } from '../intelligence/learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { RuntimeMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'

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
  somaticSignature?: ReturnType<typeof runChunkedNodePipeline>['somaticSignature']
  somaticInfluence?: ReturnType<typeof runChunkedNodePipeline>['somaticInfluence']
  relevantSomaticMarkers?: ReturnType<typeof runChunkedNodePipeline>['relevantSomaticMarkers']
}

export const runSignalIntelligenceRuntime = async ({
  text,
  plasticity,
  provider,
  runtimeMode,
  personalLearning,
}: SignalIntelligenceRuntimeInput): Promise<SignalIntelligenceRuntimeResult> => {
  const legacyResult = runLegacyNodePipeline(text, plasticity)

  if (runtimeMode === 'signal') {
    const signalResult = runSignalRuntime(text)

    return {
      runtimeMode: 'signal',
      pipelineResult: legacyResult.pipelineResult,
      studioView: legacyResult.studioView,
      revisionEntry: buildSignalRevisionEntry(signalResult),
      assistantReply: signalResult.utterance,
      signalResult,
    }
  }

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
  const assistantReply = await generateSurfaceReply({ provider, studioView: legacyResult.studioView })

  return {
    runtimeMode: 'node',
    pipelineResult: legacyResult.pipelineResult,
    studioView: legacyResult.studioView,
    revisionEntry: legacyResult.revisionEntry,
    assistantReply,
    chunkedResult,
    somaticSignature: chunkedResult.somaticSignature,
    somaticInfluence: chunkedResult.somaticInfluence,
    relevantSomaticMarkers: chunkedResult.relevantSomaticMarkers,
  }
}
