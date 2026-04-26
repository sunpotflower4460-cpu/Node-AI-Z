import type { SignalPersonalBranch } from './signalBranchTypes'

export type SignalBranchSummary = {
  branchId: string
  mode: 'signal_mode'
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  teacherFreeBridgeCount: number
  averageTeacherDependency: number
  averageRecallSuccess: number
  mostStableAssemblies: Array<{
    id: string
    recurrenceCount: number
    stabilityScore: number
  }>
  matureBridges: Array<{
    id: string
    stage: string
    confidence: number
    teacherDependency: number
    recallSuccess: number
  }>
  createdAt: number
  updatedAt: number
}

/**
 * Build a compact summary of the Signal Personal Branch for observation/display.
 *
 * Includes:
 * - Overall counts
 * - Teacher dependency metrics
 * - Most stable assemblies
 * - Most mature bridges
 */
export function buildSignalBranchSummary(
  branch: SignalPersonalBranch,
): SignalBranchSummary {
  // Find most stable assemblies (top 5)
  const sortedAssemblies = [...branch.assemblyRecords]
    .sort((a, b) => b.stabilityScore - a.stabilityScore)
    .slice(0, 5)
    .map(a => ({
      id: a.assemblyId,
      recurrenceCount: a.recurrenceCount,
      stabilityScore: a.stabilityScore,
    }))

  // Find most mature bridges (teacher_free or promoted, top 5)
  const sortedBridges = [...branch.bridgeRecords]
    .filter(b => b.stage === 'teacher_free' || b.stage === 'promoted' || b.stage === 'teacher_light')
    .sort((a, b) => b.recallSuccessScore - a.recallSuccessScore)
    .slice(0, 5)
    .map(b => ({
      id: b.id,
      stage: b.stage,
      confidence: b.confidence,
      teacherDependency: b.teacherDependencyScore,
      recallSuccess: b.recallSuccessScore,
    }))

  return {
    branchId: branch.id,
    mode: 'signal_mode',
    assemblyCount: branch.summary.assemblyCount,
    bridgeCount: branch.summary.bridgeCount,
    protoSeedCount: branch.summary.protoSeedCount,
    teacherFreeBridgeCount: branch.summary.teacherFreeBridgeCount,
    averageTeacherDependency: branch.summary.averageTeacherDependency,
    averageRecallSuccess: branch.summary.averageRecallSuccess,
    mostStableAssemblies: sortedAssemblies,
    matureBridges: sortedBridges,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  }
}
