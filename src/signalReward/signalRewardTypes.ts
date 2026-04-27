import type { SignalActionType } from '../signalAction/signalActionTypes'

export type SignalOutcomeRecord = {
  id: string
  actionId: string
  targetId: string
  targetType: 'assembly' | 'bridge' | 'proto_seed' | 'sequence' | 'contrast'
  outcomeType: string
  rewardValue: number
  errorValue: number
  createdAt: number
  notes: string[]
}

export type SignalOutcomeMemory = {
  records: SignalOutcomeRecord[]
  averageReward: number
  recentErrorRate: number
  successfulActionTypes: Partial<Record<SignalActionType, number>>
}
