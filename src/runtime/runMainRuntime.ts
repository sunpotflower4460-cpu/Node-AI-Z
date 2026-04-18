import type { PersonalLearningState } from '../learning/types'
import type { ApiProviderId } from '../types/apiProvider'
import type { ImplementationMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import type { RuntimeResult } from './runtimeTypes'
import { runJibunKaigiApiRuntime } from './runJibunKaigiApiRuntime'
import { runCrystallizedThinkingRuntime } from './runCrystallizedThinkingRuntime'

/**
 * Main runtime dispatcher.
 * Routes to the appropriate implementation based on mode selection.
 *
 * IMPORTANT: This function dispatches to ONE mode only - no fallback between modes.
 */

export type MainRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  implementationMode: ImplementationMode
  personalLearning: PersonalLearningState
}

/**
 * Run the main runtime based on implementation mode.
 *
 * - jibun_kaigi_api: API-driven with provider selection
 * - crystallized_thinking: API-independent with Dual Stream/Signal/ProtoMeaning
 */
export const runMainRuntime = async ({
  text,
  plasticity,
  provider,
  implementationMode,
  personalLearning,
}: MainRuntimeInput): Promise<RuntimeResult> => {
  if (implementationMode === 'jibun_kaigi_api') {
    return runJibunKaigiApiRuntime({
      text,
      plasticity,
      provider,
      personalLearning,
    })
  }

  // crystallized_thinking mode
  return runCrystallizedThinkingRuntime({
    text,
    plasticity,
    personalLearning,
  })
}

