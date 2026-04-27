import type { SignalActionType } from '../signalAction/signalActionTypes'
import type { SignalOutcomeMemory } from './signalRewardTypes'

export type SignalRewardSummary = {
  totalRecords: number
  averageReward: number
  recentErrorRate: number
  bestActionTypes: Array<{
    actionType: SignalActionType
    successCount: number
  }>
  latestOutcome?: string
}

export function buildSignalRewardSummary(memory: SignalOutcomeMemory): SignalRewardSummary {
  const bestActionTypes = Object.entries(memory.successfulActionTypes)
    .sort(([, countA], [, countB]) => (countB ?? 0) - (countA ?? 0))
    .slice(0, 5)
    .map(([actionType, successCount]) => ({
      actionType: actionType as SignalActionType,
      successCount: successCount ?? 0,
    }))

  return {
    totalRecords: memory.records.length,
    averageReward: memory.averageReward,
    recentErrorRate: memory.recentErrorRate,
    bestActionTypes,
    latestOutcome: memory.records.at(-1)?.outcomeType,
  }
}
