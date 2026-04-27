import type { ActiveAttentionTarget } from './activeAttentionTypes'

const REASON_BASE_URGENCY: Record<ActiveAttentionTarget['reason'], number> = {
  unstable_but_repeating: 0.76,
  teacher_dependency_high: 0.72,
  recall_failed: 0.8,
  high_promotion_readiness: 0.68,
  sequence_prediction_mismatch: 0.7,
  contrast_unclear: 0.66,
}

export type AttentionUrgencyInput = {
  reason: ActiveAttentionTarget['reason']
  recurrenceCount?: number
  instability?: number
  teacherDependencyScore?: number
  failedRecallCount?: number
  readinessScore?: number
  mismatchScore?: number
  uncertainty?: number
}

export function scoreAttentionUrgency(input: AttentionUrgencyInput): number {
  const base = REASON_BASE_URGENCY[input.reason] ?? 0.5
  const recurrenceBoost = Math.min(0.12, (input.recurrenceCount ?? 0) * 0.02)
  const instabilityBoost = Math.max(0, Math.min(0.12, input.instability ?? 0))
  const teacherBoost = Math.max(0, Math.min(0.12, input.teacherDependencyScore ?? 0))
  const recallBoost = Math.min(0.12, (input.failedRecallCount ?? 0) * 0.03)
  const readinessBoost = Math.max(0, Math.min(0.12, input.readinessScore ?? 0))
  const mismatchBoost = Math.max(0, Math.min(0.12, input.mismatchScore ?? 0))
  const uncertaintyBoost = Math.max(0, Math.min(0.12, input.uncertainty ?? 0))

  return Math.min(
    1,
    base +
      recurrenceBoost +
      instabilityBoost +
      teacherBoost +
      recallBoost +
      readinessBoost +
      mismatchBoost +
      uncertaintyBoost,
  )
}
