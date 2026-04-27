import type { AttentionAllocation } from '../signalAttention/signalAttentionTypes'

const MIN_ATTENTION_TARGETS = 1
const MAX_ATTENTION_TARGETS = 6
const BUDGET_PER_TARGET = 12

export function computeActiveAttentionBudgetLimit(
  allocation: AttentionAllocation,
): number {
  return Math.max(
    MIN_ATTENTION_TARGETS,
    Math.min(
      MAX_ATTENTION_TARGETS,
      Math.floor(
        (allocation.replayBudget +
          allocation.teacherBudget +
          allocation.consolidationBudget) /
          BUDGET_PER_TARGET,
      ),
    ),
  )
}
