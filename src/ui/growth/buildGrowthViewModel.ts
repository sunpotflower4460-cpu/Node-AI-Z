import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { SignalBridgeRecord, SignalAssemblyRecord, SignalProtoSeedRecord, SignalRecallEvent } from '../../signalBranch/signalBranchTypes'

export type GrowthSummary = {
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  recallEventCount: number
  teacherFreeBridgeCount: number
  averageRecallSuccess: number
  promotionReadyCandidates: number
}

export type GrowthAssemblyRecord = {
  id: string
  assemblyId: string
  recurrenceCount: number
  replayCount: number
  stabilityScore: number
  sourceHistory: string[]
  isPromotionReady: boolean
  lastActivatedAt: number
}

export type GrowthBridgeRecord = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  stage: string
  createdBy: string
  teacherDependencyScore: number
  recallSuccessScore: number
  confidence: number
  teacherConfirmCount: number
  selfRecallSuccessCount: number
  failedRecallCount: number
}

export type GrowthProtoSeedRecord = {
  id: string
  protoSeedId: string
  sourceAssemblyIds: string[]
  recurrenceCount: number
  stabilityScore: number
  labelCandidate?: string
  labelConfidence?: number
}

export type GrowthRecallEvent = {
  id: string
  sourceAssemblyId: string
  recalledAssemblyId?: string
  success: boolean
  usedTeacher: boolean
  timestamp: number
  notes: string[]
}

export type GrowthViewModel = {
  summary: GrowthSummary
  assemblies: GrowthAssemblyRecord[]
  bridges: GrowthBridgeRecord[]
  protoSeeds: GrowthProtoSeedRecord[]
  recallEvents: GrowthRecallEvent[]
}

const mapAssembly = (record: SignalAssemblyRecord): GrowthAssemblyRecord => ({
  id: record.id,
  assemblyId: record.assemblyId,
  recurrenceCount: record.recurrenceCount,
  replayCount: record.replayCount,
  stabilityScore: record.stabilityScore,
  sourceHistory: record.sourceHistory,
  isPromotionReady: record.stabilityScore > 0.7 && record.recurrenceCount >= 3,
  lastActivatedAt: record.lastActivatedAt,
})

const mapBridge = (record: SignalBridgeRecord): GrowthBridgeRecord => ({
  id: record.id,
  sourceAssemblyId: record.sourceAssemblyId,
  targetAssemblyId: record.targetAssemblyId,
  stage: record.stage,
  createdBy: record.createdBy,
  teacherDependencyScore: record.teacherDependencyScore,
  recallSuccessScore: record.recallSuccessScore,
  confidence: record.confidence,
  teacherConfirmCount: record.teacherConfirmCount,
  selfRecallSuccessCount: record.selfRecallSuccessCount,
  failedRecallCount: record.failedRecallCount,
})

const mapProtoSeed = (record: SignalProtoSeedRecord): GrowthProtoSeedRecord => ({
  id: record.id,
  protoSeedId: record.protoSeedId,
  sourceAssemblyIds: record.sourceAssemblyIds,
  recurrenceCount: record.recurrenceCount,
  stabilityScore: record.stabilityScore,
  labelCandidate: record.labelCandidate,
  labelConfidence: record.labelConfidence,
})

const mapRecallEvent = (event: SignalRecallEvent): GrowthRecallEvent => ({
  id: event.id,
  sourceAssemblyId: event.sourceAssemblyId,
  recalledAssemblyId: event.recalledAssemblyId,
  success: event.success,
  usedTeacher: event.usedTeacher,
  timestamp: event.timestamp,
  notes: event.notes,
})

export const buildGrowthViewModel = (source: SignalOverviewSource): GrowthViewModel => {
  const branch = source.observeSummary.branch
  const brainLikeGrowth = source.observeSummary.brainLikeGrowth

  const summary: GrowthSummary = {
    assemblyCount: branch.assemblyCount,
    bridgeCount: branch.bridgeCount,
    protoSeedCount: branch.protoSeedCount,
    recallEventCount: 0,
    teacherFreeBridgeCount: branch.teacherFreeBridgeCount,
    averageRecallSuccess: branch.averageRecallSuccess,
    promotionReadyCandidates: brainLikeGrowth.promotionReadiness.readyCount,
  }

  return {
    summary,
    assemblies: [],
    bridges: branch.matureBridges.map((b) => ({
      id: b.id,
      sourceAssemblyId: '',
      targetAssemblyId: '',
      stage: b.stage,
      createdBy: 'binding_teacher',
      teacherDependencyScore: b.teacherDependency,
      recallSuccessScore: b.recallSuccess,
      confidence: b.confidence,
      teacherConfirmCount: 0,
      selfRecallSuccessCount: 0,
      failedRecallCount: 0,
    })),
    protoSeeds: [],
    recallEvents: [],
  }
}

export const buildGrowthViewModelFromBranch = (
  source: SignalOverviewSource,
  assemblyRecords?: SignalAssemblyRecord[],
  bridgeRecords?: SignalBridgeRecord[],
  protoSeedRecords?: SignalProtoSeedRecord[],
  recallEvents?: SignalRecallEvent[],
): GrowthViewModel => {
  const base = buildGrowthViewModel(source)

  return {
    ...base,
    summary: {
      ...base.summary,
      recallEventCount: recallEvents?.length ?? 0,
    },
    assemblies: assemblyRecords?.map(mapAssembly) ?? [],
    bridges: bridgeRecords?.map(mapBridge) ?? base.bridges,
    protoSeeds: protoSeedRecords?.map(mapProtoSeed) ?? [],
    recallEvents: recallEvents?.map(mapRecallEvent) ?? [],
  }
}
