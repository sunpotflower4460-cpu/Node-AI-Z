/**
 * Signal Attention Types
 *
 * Implements attention/energy budget for Signal Mode.
 * Prevents unlimited firing and learning by introducing resource constraints.
 */

export type SignalAttentionBudget = {
  totalBudget: number
  availableBudget: number
  activationCost: number
  replayCost: number
  teacherCost: number
  consolidationCost: number
  fatigue: number
  recovery: number
  learningRateMultiplier: number
}

export type AttentionAllocation = {
  activationBudget: number
  propagationBudget: number
  replayBudget: number
  teacherBudget: number
  consolidationBudget: number
  notes: string[]
}
