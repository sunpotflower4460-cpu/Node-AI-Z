import type { PersonalLearningState } from '../learning/types'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId } from '../types/apiProvider'
import type { PlasticityState } from '../types/nodeStudio'
import type { JibunKaigiApiResult } from './runtimeTypes'
import { runLegacyNodePipeline } from './runLegacyNodePipeline'

/**
 * Jibun Kaigi API Runtime
 * API-driven approach using provider selection to generate responses.
 * This is the traditional "conversation with AI" mode.
 */

export type JibunKaigiApiRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  personalLearning: PersonalLearningState
}

/**
 * Run the Jibun Kaigi API runtime.
 * Uses legacy node pipeline + provider-based surface generation.
 */
export const runJibunKaigiApiRuntime = async ({
  text,
  plasticity,
  provider,
}: JibunKaigiApiRuntimeInput): Promise<JibunKaigiApiResult> => {
  // Run legacy node pipeline
  const legacyResult = runLegacyNodePipeline(text, plasticity)

  // Generate surface reply using provider
  const assistantReply = await generateSurfaceReply({
    provider,
    studioView: legacyResult.studioView
  })

  return {
    implementationMode: 'jibun_kaigi_api',
    provider,
    pipelineResult: legacyResult.pipelineResult,
    studioView: legacyResult.studioView,
    revisionEntry: legacyResult.revisionEntry,
    assistantReply,
  }
}
