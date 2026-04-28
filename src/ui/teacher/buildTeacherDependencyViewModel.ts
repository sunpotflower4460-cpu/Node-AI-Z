import type { SignalOverviewSource } from '../../observe/signalOverviewSource'

export type BridgeStageDistribution = {
  tentative: number
  reinforced: number
  teacher_light: number
  teacher_free: number
  promoted: number
}

export type TeacherBridgeEntry = {
  id: string
  stage: string
  createdBy: string
  teacherDependencyScore: number
  recallSuccessScore: number
  confidence: number
}

export type TeacherDependencyViewModel = {
  averageTeacherDependency: number
  teacherAssistedBridgeCount: number
  teacherLightBridgeCount: number
  teacherFreeBridgeCount: number
  teacherOvertrustRisk: number
  bridgeStageDistribution: BridgeStageDistribution
  bridges: TeacherBridgeEntry[]
  hasOvertrustRisk: boolean
}

export const buildTeacherDependencyViewModel = (source: SignalOverviewSource): TeacherDependencyViewModel => {
  const branch = source.observeSummary.branch
  const risk = source.riskReport

  const bridges = branch.matureBridges

  const stageDistribution: BridgeStageDistribution = {
    tentative: bridges.filter((b) => b.stage === 'tentative').length,
    reinforced: bridges.filter((b) => b.stage === 'reinforced').length,
    teacher_light: bridges.filter((b) => b.stage === 'teacher_light').length,
    teacher_free: bridges.filter((b) => b.stage === 'teacher_free').length,
    promoted: bridges.filter((b) => b.stage === 'promoted').length,
  }

  const teacherAssistedCount =
    stageDistribution.tentative +
    stageDistribution.reinforced

  const teacherLightCount = stageDistribution.teacher_light

  const bridgeEntries: TeacherBridgeEntry[] = bridges.map((b) => ({
    id: b.id,
    stage: b.stage,
    createdBy: 'binding_teacher',
    teacherDependencyScore: b.teacherDependency,
    recallSuccessScore: b.recallSuccess,
    confidence: b.confidence,
  }))

  return {
    averageTeacherDependency: branch.averageTeacherDependency,
    teacherAssistedBridgeCount: teacherAssistedCount,
    teacherLightBridgeCount: teacherLightCount,
    teacherFreeBridgeCount: branch.teacherFreeBridgeCount,
    teacherOvertrustRisk: risk.teacherOvertrustRisk,
    bridgeStageDistribution: stageDistribution,
    bridges: bridgeEntries,
    hasOvertrustRisk: risk.teacherOvertrustRisk > 0.5,
  }
}
