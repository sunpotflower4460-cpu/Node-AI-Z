import type { SignalModeRuntimeInput } from '../runtime/runSignalModeRuntime'
import type { SignalAblationConfig } from './signalAblationTypes'

/**
 * Apply ablation config to a SignalModeRuntimeInput.
 * Returns a modified copy that disables features according to config.
 */
export function applyAblationConfig(
  input: SignalModeRuntimeInput,
  config?: SignalAblationConfig,
): SignalModeRuntimeInput {
  if (!config) return input

  const result = { ...input }

  if (!config.teacherEnabled) {
    result.enableBindingTeacher = false
    result.textSummary = undefined
    result.imageSummary = undefined
    result.audioSummary = undefined
  }

  if (!config.dreamEnabled || !config.consolidationEnabled) {
    // Force user active so consolidation/dream is skipped
    result.isUserActive = true
    result.recentActivityLevel = 0.9
  }

  return result
}
