export type ActiveAttentionTarget = {
  id: string
  targetType: 'assembly' | 'bridge' | 'proto_seed' | 'sequence' | 'contrast'
  targetId: string
  urgency: number
  reason:
    | 'unstable_but_repeating'
    | 'teacher_dependency_high'
    | 'recall_failed'
    | 'high_promotion_readiness'
    | 'sequence_prediction_mismatch'
    | 'contrast_unclear'
  recommendedAction:
    | 'replay'
    | 'compare'
    | 'ask_teacher'
    | 'observe_next_turn'
    | 'suppress'
    | 'strengthen'
}

export type ActiveAttentionSummary = {
  budgetLimit: number
  selectedTargets: ActiveAttentionTarget[]
  teacherQueryTargetIds: string[]
  notes: string[]
}
