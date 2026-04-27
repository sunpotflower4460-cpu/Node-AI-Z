import type { SignalOutcomeRecord } from '../signalReward/signalRewardTypes'
import type { HierarchicalPredictionComparison } from '../signalPrediction/hierarchicalPredictionTypes'
import type { SignalReconsolidationState } from './signalReconsolidationTypes'

export function openMemoryForReconsolidation(input: {
  previous: SignalReconsolidationState
  recentOutcomes: SignalOutcomeRecord[]
  predictionComparisons: HierarchicalPredictionComparison[]
  timestamp: number
}): SignalReconsolidationState {
  const windows = [...input.previous.openMemories]

  for (const outcome of input.recentOutcomes.filter(record => record.errorValue >= 0.55)) {
    if (!windows.some(window => window.targetId === outcome.targetId)) {
      windows.push({
        id: `recon_outcome_${outcome.targetId}_${input.timestamp}`,
        targetType: outcome.targetType,
        targetId: outcome.targetId,
        reason: outcome.outcomeType === 'prediction_failed' ? 'prediction_error' : 'reward_drop',
        openedAt: input.timestamp,
        notes: outcome.notes,
      })
    }
  }

  for (const comparison of input.predictionComparisons.filter(entry => !entry.confirmed && entry.surprise >= 0.55)) {
    if (!windows.some(window => window.targetId === comparison.targetId)) {
      windows.push({
        id: `recon_prediction_${comparison.targetId}_${input.timestamp}`,
        targetType: comparison.targetType === 'sequence' ? 'sequence' : comparison.targetType,
        targetId: comparison.targetId,
        reason: 'prediction_error',
        openedAt: input.timestamp,
        notes: comparison.notes,
      })
    }
  }

  return {
    openMemories: windows.slice(-10),
    recentlyRevisedTargetIds: input.previous.recentlyRevisedTargetIds,
    recentlyRestabilizedTargetIds: input.previous.recentlyRestabilizedTargetIds,
    lastUpdatedAt: input.timestamp,
    notes: windows.length > 0 ? ['Memories reopened for revision after failure or surprise'] : [],
  }
}
