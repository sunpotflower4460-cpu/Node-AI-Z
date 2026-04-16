import type { PersonalLearningState } from '../intelligence/learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { RuntimeMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'
import { runSignalIntelligenceRuntime, type SignalIntelligenceRuntimeResult } from './runSignalIntelligenceRuntime'

export type RuntimeSource = 'legacy-node-pipeline' | 'signal-intelligence'

export type MainRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  runtimeMode: RuntimeMode
  personalLearning: PersonalLearningState
  source?: RuntimeSource
}

export const runMainRuntime = async ({
  source = 'signal-intelligence',
  ...input
}: MainRuntimeInput): Promise<SignalIntelligenceRuntimeResult> => {
  if (source === 'legacy-node-pipeline') {
    const legacyResult = runLegacyNodePipeline(input.text, input.plasticity)
    const assistantReply = await generateSurfaceReply({ provider: input.provider, studioView: legacyResult.studioView })

    return {
      runtimeMode: 'node',
      pipelineResult: legacyResult.pipelineResult,
      studioView: legacyResult.studioView,
      revisionEntry: legacyResult.revisionEntry,
      assistantReply,
    }
  }

  return runSignalIntelligenceRuntime(input)
}
