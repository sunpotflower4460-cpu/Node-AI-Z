import type { ActiveAttentionSummary, ActiveAttentionTarget } from './activeAttentionTypes'

export function buildActiveAttentionSummary(input: {
  selectedTargets: ActiveAttentionTarget[]
  teacherQueryTargetIds: string[]
  budgetLimit: number
}): ActiveAttentionSummary {
  const notes: string[] = []

  if (input.selectedTargets.length === 0) {
    notes.push('No urgent active-attention targets selected this turn')
  }

  if (input.teacherQueryTargetIds.length > 0) {
    notes.push('Teacher queries restricted to the highest-urgency uncertainty targets')
  }

  return {
    budgetLimit: input.budgetLimit,
    selectedTargets: input.selectedTargets,
    teacherQueryTargetIds: input.teacherQueryTargetIds,
    notes,
  }
}
