import type { SignalAction, SignalActionResult } from './signalActionTypes'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const REWARD_BY_OUTCOME: Record<SignalActionResult['outcomeType'], number> = {
  recall_success: 0.6,
  recall_failed: -0.45,
  bridge_strengthened: 0.55,
  contrast_clarified: 0.5,
  prediction_confirmed: 0.45,
  prediction_failed: -0.35,
  noise_reduced: 0.35,
  no_effect: 0.05,
}

export function evaluateSignalActionOutcome(
  action: SignalAction,
  result: Omit<SignalActionResult, 'rewardValue'>,
): SignalActionResult {
  let rewardValue = REWARD_BY_OUTCOME[result.outcomeType]

  if (action.actionType === 'hold_uncertain' && result.success) {
    rewardValue = 0.15
  }

  if (action.actionType === 'ask_teacher' && result.success) {
    rewardValue -= 0.05
  }

  if (!result.success && rewardValue > 0) {
    rewardValue *= -1
  }

  return {
    ...result,
    rewardValue: clamp(rewardValue, -1, 1),
  }
}
