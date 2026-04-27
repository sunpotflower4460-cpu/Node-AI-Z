import type { SignalAction, SignalActionResult } from '../signalAction/signalActionTypes'
import type { SignalOutcomeRecord } from './signalRewardTypes'

export function recordActionOutcome(input: {
  action: SignalAction
  result: SignalActionResult
  errorValue: number
  timestamp: number
}): SignalOutcomeRecord {
  return {
    id: `outcome_${input.action.id}_${input.timestamp}`,
    actionId: input.action.id,
    targetId: input.action.targetId,
    targetType: input.action.targetType,
    outcomeType: input.result.outcomeType,
    rewardValue: input.result.rewardValue,
    errorValue: input.errorValue,
    createdAt: input.timestamp,
    notes: input.result.notes,
  }
}
