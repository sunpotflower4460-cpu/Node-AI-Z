export type SignalActionType =
  | 'replay_assembly'
  | 'test_bridge'
  | 'ask_teacher'
  | 'compare_contrast'
  | 'predict_sequence'
  | 'suppress_noise'
  | 'strengthen_candidate'
  | 'hold_uncertain'

export type SignalActionTargetType = 'assembly' | 'bridge' | 'proto_seed' | 'sequence' | 'contrast'

export type SignalAction = {
  id: string
  actionType: SignalActionType
  targetType: SignalActionTargetType
  targetId: string
  reason: string
  expectedOutcome: string
  cost: number
  selectedAt: number
}

export type SignalActionResult = {
  actionId: string
  success: boolean
  outcomeType:
    | 'recall_success'
    | 'recall_failed'
    | 'bridge_strengthened'
    | 'contrast_clarified'
    | 'prediction_confirmed'
    | 'prediction_failed'
    | 'noise_reduced'
    | 'no_effect'
  rewardValue: number
  notes: string[]
}
