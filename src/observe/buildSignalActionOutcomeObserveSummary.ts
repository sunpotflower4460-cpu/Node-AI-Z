import type { SignalActionSummary } from '../signalAction/buildSignalActionSummary'
import type { SignalRewardSummary } from '../signalReward/buildSignalRewardSummary'
import type { SignalModulatorSummary } from '../signalModulator/buildModulatorSummary'
import type { HierarchicalPredictionSummary } from '../signalPrediction/buildHierarchicalPredictionSummary'
import type { ReconsolidationSummary } from '../signalReconsolidation/buildReconsolidationSummary'
import type { SignalDevelopmentState } from '../signalDevelopment/signalDevelopmentTypes'

export type SignalActionOutcomeObserveSummary = {
  actions: SignalActionSummary
  reward: SignalRewardSummary
  modulators: SignalModulatorSummary
  prediction: HierarchicalPredictionSummary
  reconsolidation: ReconsolidationSummary
  development: SignalDevelopmentState
  notes: string[]
}

export function buildSignalActionOutcomeObserveSummary(input: {
  actions: SignalActionSummary
  reward: SignalRewardSummary
  modulators: SignalModulatorSummary
  prediction: HierarchicalPredictionSummary
  reconsolidation: ReconsolidationSummary
  development: SignalDevelopmentState
}): SignalActionOutcomeObserveSummary {
  const notes: string[] = []

  if (input.reward.recentErrorRate >= 0.55) {
    notes.push('Outcome errors are high; replay, contrast, and reconsolidation should stay active')
  }
  if (input.modulators.mode === 'recover') {
    notes.push('Global modulators are in recovery mode due to overload or fatigue')
  }
  if (input.development.stage >= 7 && input.actions.totalSelected > 0) {
    notes.push('Signal Mode selected its own internal actions this turn')
  }

  return {
    ...input,
    notes,
  }
}
