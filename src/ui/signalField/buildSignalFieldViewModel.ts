import type { SignalOverviewSource } from '../../observe/signalOverviewSource'
import type { SignalFieldState } from '../../signalField/signalFieldTypes'

export type ParticleViewModel = {
  id: string
  x: number
  y: number
  z?: number
  activation: number
  source?: 'external' | 'internal' | 'teacher'
}

export type AssemblyViewModel = {
  id: string
  particleIds: string[]
  stabilityScore: number
  recurrenceCount: number
  replayCount: number
  lastActivatedAt: number
}

export type BridgeViewModel = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  stage: string
  createdBy: string
  teacherDependencyScore: number
  recallSuccessScore: number
  confidence: number
}

export type SignalFieldViewModel = {
  particles: ParticleViewModel[]
  assemblies: AssemblyViewModel[]
  bridges: BridgeViewModel[]
  summary: {
    particleCount: number
    activeParticleCount: number
    assemblyCount: number
    bridgeCount: number
    replayCount: number
    teacherAssistedBridgeCount: number
    teacherFreeBridgeCount: number
  }
}

export const buildSignalFieldViewModel = (
  source: SignalOverviewSource,
  fieldState?: SignalFieldState,
): SignalFieldViewModel => {
  const branch = source.observeSummary.branch
  const field = source.observeSummary.field

  const particles: ParticleViewModel[] = fieldState
    ? fieldState.particles.map((p) => {
        const activation = fieldState.recentActivations.find((a) => a.particleId === p.id)
        return {
          id: p.id,
          x: p.x,
          y: p.y,
          z: p.z,
          activation: p.activation,
          source: activation
            ? activation.source === 'replay'
              ? 'internal'
              : 'external'
            : undefined,
        }
      })
    : Array.from({ length: Math.max(field.activeParticleCount, 0) }, (_, index) => ({
        id: `particle-${index}`,
        x: 0.5 + Math.cos((index / Math.max(field.activeParticleCount, 1)) * Math.PI * 2) * 0.4,
        y: 0.5 + Math.sin((index / Math.max(field.activeParticleCount, 1)) * Math.PI * 2) * 0.4,
        activation: 0.5,
        source: 'external' as const,
      }))

  const assemblies: AssemblyViewModel[] = branch.mostStableAssemblies.map((a) => ({
    id: a.id,
    particleIds: [],
    stabilityScore: a.stabilityScore,
    recurrenceCount: a.recurrenceCount,
    replayCount: 0,
    lastActivatedAt: 0,
  }))

  const bridges: BridgeViewModel[] = branch.matureBridges.map((b) => ({
    id: b.id,
    sourceAssemblyId: '',
    targetAssemblyId: '',
    stage: b.stage,
    createdBy: 'binding_teacher',
    teacherDependencyScore: b.teacherDependency,
    recallSuccessScore: b.recallSuccess,
    confidence: b.confidence,
  }))

  const teacherAssistedCount = branch.matureBridges.filter(
    (b) => b.stage === 'tentative' || b.stage === 'reinforced',
  ).length

  return {
    particles,
    assemblies,
    bridges,
    summary: {
      particleCount: fieldState ? fieldState.particles.length : field.activeParticleCount,
      activeParticleCount: field.activeParticleCount,
      assemblyCount: field.assemblyCount,
      bridgeCount: field.bridgeCount,
      replayCount: field.replayTriggered ? 1 : 0,
      teacherAssistedBridgeCount: teacherAssistedCount,
      teacherFreeBridgeCount: branch.teacherFreeBridgeCount,
    },
  }
}
