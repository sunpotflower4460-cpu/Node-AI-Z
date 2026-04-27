import type { Assembly } from '../signalField/signalFieldTypes'
import type { AssemblyComparison } from './signalContrastTypes'

export function compareAssemblies(
  source: Assembly,
  target: Assembly,
): AssemblyComparison {
  const sourceSet = new Set(source.particleIds)
  const targetSet = new Set(target.particleIds)
  const sharedParticleCount = source.particleIds.filter(id => targetSet.has(id)).length
  const unionSize = new Set([...source.particleIds, ...target.particleIds]).size || 1
  const overlapRatio = sharedParticleCount / unionSize
  const recurrenceAlignment =
    1 -
    Math.min(
      1,
      Math.abs(source.recurrenceCount - target.recurrenceCount) /
        Math.max(source.recurrenceCount, target.recurrenceCount, 1),
    )
  const coactivationAlignment = 1 - Math.min(1, Math.abs(source.averageCoactivation - target.averageCoactivation))
  const temporalDistance = Math.abs(source.lastActivatedAt - target.lastActivatedAt)
  const temporalAlignment = 1 - Math.min(1, temporalDistance / 10_000)

  const similarity = Math.max(
    0,
    Math.min(
      1,
      overlapRatio * 0.55 +
        recurrenceAlignment * 0.2 +
        coactivationAlignment * 0.15 +
        temporalAlignment * 0.1,
    ),
  )

  return {
    sourceAssemblyId: source.id,
    targetAssemblyId: target.id,
    sharedParticleCount,
    overlapRatio,
    recurrenceAlignment,
    temporalDistance,
    similarity,
  }
}
