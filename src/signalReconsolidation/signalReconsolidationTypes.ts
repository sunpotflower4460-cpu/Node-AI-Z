export type ReconsolidationTargetType = 'assembly' | 'bridge' | 'proto_seed' | 'sequence' | 'contrast'

export type ReconsolidationWindow = {
  id: string
  targetType: ReconsolidationTargetType
  targetId: string
  reason: 'reward_drop' | 'prediction_error' | 'contrast_revision' | 'teacher_overuse'
  openedAt: number
  notes: string[]
}

export type SignalReconsolidationState = {
  openMemories: ReconsolidationWindow[]
  recentlyRevisedTargetIds: string[]
  recentlyRestabilizedTargetIds: string[]
  lastUpdatedAt: number
  notes: string[]
}
