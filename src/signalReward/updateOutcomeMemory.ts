import type { SignalActionType } from '../signalAction/signalActionTypes'
import type { SignalOutcomeMemory, SignalOutcomeRecord } from './signalRewardTypes'

export function updateOutcomeMemory(input: {
  memory: SignalOutcomeMemory
  record: SignalOutcomeRecord
  actionType: SignalActionType
}): SignalOutcomeMemory {
  const records = [...input.memory.records, input.record].slice(-50)
  const recent = records.slice(-10)
  const successfulActionTypes = { ...input.memory.successfulActionTypes }

  if (input.record.rewardValue > 0) {
    successfulActionTypes[input.actionType] = (successfulActionTypes[input.actionType] ?? 0) + 1
  }

  return {
    records,
    averageReward:
      records.length > 0
        ? records.reduce((sum, record) => sum + record.rewardValue, 0) / records.length
        : 0,
    recentErrorRate:
      recent.length > 0
        ? recent.reduce((sum, record) => sum + record.errorValue, 0) / recent.length
        : 0,
    successfulActionTypes,
  }
}
