import type { PersonalLearningState } from '../learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { PlasticityState } from '../types/nodeStudio'
import type { LlmModeResult } from './runtimeTypes'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'

/**
 * LLM Mode Runtime
 * API-driven approach using provider selection to generate responses.
 * This is the traditional "conversation with AI" mode.
 */

export type LlmModeRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  personalLearning: PersonalLearningState
}

/**
 * Run the LLM Mode runtime.
 * Uses legacy node pipeline + provider-based surface generation.
 */
export const runLlmModeRuntime = async ({
  text,
  plasticity,
  provider,
}: LlmModeRuntimeInput): Promise<LlmModeResult> => {
  // Run legacy node pipeline
  const legacyResult = runLegacyNodePipeline(text, plasticity)

  // Generate surface reply using provider
  const assistantReply = await generateSurfaceReply({
    provider,
    studioView: legacyResult.studioView
  })

  return {
    implementationMode: 'llm_mode',
    provider,
    pipelineResult: legacyResult.pipelineResult,
    studioView: legacyResult.studioView,
    revisionEntry: legacyResult.revisionEntry,
    assistantReply,
  }
}
