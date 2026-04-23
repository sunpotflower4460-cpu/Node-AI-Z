import type { PersonalLearningState } from '../learning/types'
import type { ApiProviderId } from '../types/apiProvider'
import type { ImplementationMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import type { RuntimeResult } from './runtimeTypes'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { LayeredBrainState } from './layeredThinkingTypes'
import { runLlmModeRuntime } from './runLlmModeRuntime'
import { runCrystallizedThinkingRuntime } from './runCrystallizedThinkingRuntime'
import { runLayeredThinkingRuntime } from './runLayeredThinkingRuntime'

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
  brainState?: SessionBrainState | LayeredBrainState
}

/**
 * Run the main runtime based on implementation mode.
 *
 * - llm_mode: API-driven with provider selection
 * - crystallized_thinking: API-independent with Dual Stream/Signal/ProtoMeaning
 *
 * Phase 1: Supports session brain state continuity for crystallized_thinking mode.
 */
export const runMainRuntime = async ({
  text,
  plasticity,
  provider,
  implementationMode,
  personalLearning,
  brainState,
}: MainRuntimeInput): Promise<RuntimeResult> => {
  if (implementationMode === 'llm_mode') {
    return runLlmModeRuntime({
      text,
      plasticity,
      provider,
      personalLearning,
    })
  }

  if (implementationMode === 'layered_thinking') {
    return runLayeredThinkingRuntime({
      text,
      plasticity,
      personalLearning,
      brainState: brainState as LayeredBrainState | undefined,
    })
  }

  // crystallized_thinking mode
  return runCrystallizedThinkingRuntime({
    text,
    plasticity,
    personalLearning,
    brainState: brainState as SessionBrainState | undefined,
  })
}
