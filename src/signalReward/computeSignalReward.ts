import type { SignalActionResult } from '../signalAction/signalActionTypes'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function computeSignalReward(
  result: SignalActionResult,
  surprise = 0,
): { rewardValue: number; errorValue: number; notes: string[] } {
  const errorBase = result.success ? 0.2 : 0.75
  const errorValue = clamp(errorBase + surprise * 0.35)
  const rewardValue = Math.max(-1, Math.min(1, result.rewardValue - surprise * 0.15))
  const notes: string[] = []

  if (surprise > 0.55) {
    notes.push('Prediction surprise increased the learning signal')
  }
  if (!result.success) {
    notes.push('Failure should bias the next turn toward replay, contrast, or teacher support')
  }

  return {
    rewardValue,
    errorValue,
    notes,
  }
}
