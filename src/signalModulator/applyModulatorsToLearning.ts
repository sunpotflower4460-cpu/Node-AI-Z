import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SignalModulatorState } from './signalModulatorTypes'

export function applyModulatorsToLearning(
  attentionBudget: SignalAttentionBudget,
  modulatorState: SignalModulatorState,
): SignalAttentionBudget {
  return {
    ...attentionBudget,
    availableBudget: Math.max(
      0,
      Math.min(
        attentionBudget.totalBudget,
        attentionBudget.availableBudget * (1 - modulatorState.overload * 0.12 + modulatorState.stability * 0.04),
      ),
    ),
    learningRateMultiplier:
      attentionBudget.learningRateMultiplier * modulatorState.learningRateMultiplier,
  }
}
