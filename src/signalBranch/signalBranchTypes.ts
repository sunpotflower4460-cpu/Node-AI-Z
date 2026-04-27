import type { ContrastRecord } from '../signalContrast/signalContrastTypes'
import type { SignalSequenceRecord } from '../signalSequence/signalSequenceTypes'
import type { SignalPlasticityRecord } from '../signalPlasticity/signalPlasticityTypes'
import type { SignalAction, SignalActionResult } from '../signalAction/signalActionTypes'
import type { SignalOutcomeMemory } from '../signalReward/signalRewardTypes'
import type { SignalModulatorState } from '../signalModulator/signalModulatorTypes'
import type { HierarchicalPredictionMemory } from '../signalPrediction/hierarchicalPredictionTypes'
import type { SignalReconsolidationState } from '../signalReconsolidation/signalReconsolidationTypes'
import type { SignalDevelopmentState } from '../signalDevelopment/signalDevelopmentTypes'

export type SignalExperienceSource =
  | 'external_stimulus'
  | 'internal_replay'
  | 'teacher_signal'
  | 'self_discovered'
  | 'future_mother_hint'
  | 'future_aeterna_baseline'

export type SignalAssemblyRecord = {
  id: string
  assemblyId: string
  particleIds: string[]
  recurrenceCount: number
  replayCount: number
  lastActivatedAt: number
  stabilityScore: number
  sourceHistory: SignalExperienceSource[]
}

export type SignalBridgeRecord = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  stage: 'tentative' | 'reinforced' | 'teacher_light' | 'teacher_free' | 'promoted'
  createdBy: 'binding_teacher' | 'self_discovered'
  teacherConfirmCount: number
  selfRecallSuccessCount: number
  failedRecallCount: number
  confidence: number
  teacherDependencyScore: number
  recallSuccessScore: number
  lastUsedAt: number
}

export type SignalProtoSeedRecord = {
  id: string
  protoSeedId: string
  sourceAssemblyIds: string[]
  recurrenceCount: number
  stabilityScore: number
  labelCandidate?: string
  labelConfidence?: number
  createdAt: number
  updatedAt: number
}

export type SignalRecallEvent = {
  id: string
  sourceAssemblyId: string
  recalledAssemblyId?: string
  success: boolean
  usedTeacher: boolean
  timestamp: number
  notes: string[]
}

export type SignalPersonalBranch = {
  id: string
  mode: 'signal_mode'
  createdAt: number
  updatedAt: number
  assemblyRecords: SignalAssemblyRecord[]
  bridgeRecords: SignalBridgeRecord[]
  protoSeedRecords: SignalProtoSeedRecord[]
  contrastRecords: ContrastRecord[]
  sequenceRecords: SignalSequenceRecord[]
  plasticityRecords: SignalPlasticityRecord[]
  recentRecallEvents: SignalRecallEvent[]
  actionHistory: SignalAction[]
  actionResults: SignalActionResult[]
  outcomeMemory: SignalOutcomeMemory
  modulatorState: SignalModulatorState
  predictionMemory: HierarchicalPredictionMemory
  reconsolidationState: SignalReconsolidationState
  developmentState: SignalDevelopmentState
  summary: {
    assemblyCount: number
    bridgeCount: number
    protoSeedCount: number
    teacherFreeBridgeCount: number
    averageTeacherDependency: number
    averageRecallSuccess: number
  }
}
