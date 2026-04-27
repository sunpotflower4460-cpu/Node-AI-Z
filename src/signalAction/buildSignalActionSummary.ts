import type { SignalAction, SignalActionResult } from './signalActionTypes'

export type SignalActionSummary = {
  totalSelected: number
  successfulActions: number
  failedActions: number
  recentActions: Array<{
    actionType: SignalAction['actionType']
    targetType: SignalAction['targetType']
    targetId: string
    rewardValue: number
  }>
  notes: string[]
}

export function buildSignalActionSummary(
  actions: SignalAction[],
  results: SignalActionResult[],
): SignalActionSummary {
  const rewardsByAction = new Map(results.map(result => [result.actionId, result.rewardValue]))
  const successfulActions = results.filter(result => result.success).length
  const failedActions = results.length - successfulActions
  const notes: string[] = []

  if (actions.length === 0) {
    notes.push('No internal actions selected this turn')
  }
  if (failedActions > successfulActions && results.length > 0) {
    notes.push('Action selection should shift toward safer recall or more teacher support')
  }

  return {
    totalSelected: actions.length,
    successfulActions,
    failedActions,
    recentActions: actions.map(action => ({
      actionType: action.actionType,
      targetType: action.targetType,
      targetId: action.targetId,
      rewardValue: rewardsByAction.get(action.id) ?? 0,
    })),
    notes,
  }
}
