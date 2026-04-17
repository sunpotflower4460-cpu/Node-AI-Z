import type { PersonalLearningState } from '../learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { RuntimeMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'
import { runSignalIntelligenceRuntime, type SignalIntelligenceRuntimeResult } from './runSignalIntelligenceRuntime'

/**
 * Top-level runtime entry used by Observe / Experience.
 * UI callers pass mode + input, and this function chooses which internal route
 * owns the run: the legacy node backbone or the signal-intelligence route.
 */
export type RuntimeSource = 'legacy-node-pipeline' | 'signal-intelligence'

export type MainRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  runtimeMode: RuntimeMode
  personalLearning: PersonalLearningState
  source?: RuntimeSource
}

const runLegacyMainRoute = async ({
  text,
  plasticity,
  provider,
}: Pick<MainRuntimeInput, 'text' | 'plasticity' | 'provider'>): Promise<SignalIntelligenceRuntimeResult> => {
  const legacyResult = runLegacyNodePipeline(text, plasticity)
  const assistantReply = await generateSurfaceReply({ provider, studioView: legacyResult.studioView })

  return {
    runtimeMode: 'node',
    pipelineResult: legacyResult.pipelineResult,
    studioView: legacyResult.studioView,
    revisionEntry: legacyResult.revisionEntry,
    assistantReply,
  }
}

export const runMainRuntime = async ({
  source = 'signal-intelligence',
  ...input
}: MainRuntimeInput): Promise<SignalIntelligenceRuntimeResult> => {
  if (source === 'legacy-node-pipeline') {
    return runLegacyMainRoute(input)
  }

  return runSignalIntelligenceRuntime(input)
}
