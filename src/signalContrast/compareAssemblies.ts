import type { Assembly } from '../signalField/signalFieldTypes'
import type { AssemblyComparison } from './signalContrastTypes'

const OVERLAP_WEIGHT = 0.55
const RECURRENCE_WEIGHT = 0.2
const COACTIVATION_WEIGHT = 0.15
const TEMPORAL_WEIGHT = 0.1

export function compareAssemblies(
  source: Assembly,
  target: Assembly,
): AssemblyComparison {
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
      overlapRatio * OVERLAP_WEIGHT +
        recurrenceAlignment * RECURRENCE_WEIGHT +
        coactivationAlignment * COACTIVATION_WEIGHT +
        temporalAlignment * TEMPORAL_WEIGHT,
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
