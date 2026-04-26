import type { SignalAttentionBudget } from './signalAttentionTypes'

/**
 * Create initial attention budget for Signal Mode.
 */
export function createInitialAttentionBudget(): SignalAttentionBudget {
  const totalBudget = 100.0

  return {
    totalBudget,
    availableBudget: totalBudget,
    activationCost: 0,
    replayCost: 0,
    teacherCost: 0,
    consolidationCost: 0,
    fatigue: 0,
    recovery: 1.0,
    learningRateMultiplier: 1.0,
  }
}
