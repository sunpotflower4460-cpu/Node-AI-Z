import type { SignalPromotionReadiness } from './signalPromotionReadinessTypes'
import type { SignalProtoSeedRecord, SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

/**
 * Compute promotion readiness for a proto-seed.
 *
 * Evaluates:
 * - Recurrence count (how often it appears)
 * - Stability score
 * - Source assembly stability (are the underlying assemblies stable?)
 * - Label consistency (if labels exist, are they consistent?)
 */
export function computeProtoSeedPromotionReadiness(
  protoSeed: SignalProtoSeedRecord,
  branch: SignalPersonalBranch,
): SignalPromotionReadiness {
  const notes: string[] = []

  // Recurrence score
  const recurrenceScore = Math.min(1.0, protoSeed.recurrenceCount / 8)

  // Stability score: direct from proto-seed
  const stabilityScore = protoSeed.stabilityScore

  // Check source assemblies: are they stable?
  const sourceAssemblies = protoSeed.sourceAssemblyIds
    .map(id => branch.assemblyRecords.find(r => r.assemblyId === id))
    .filter(Boolean)

  const avgSourceStability =
    sourceAssemblies.length > 0
      ? sourceAssemblies.reduce((sum, a) => sum + (a?.stabilityScore ?? 0), 0) /
        sourceAssemblies.length
      : 0

  // Label consistency: if label exists, how confident?
  const labelConsistency = protoSeed.labelConfidence ?? 0.5

  // Teacher independence: proto-seeds are generally teacher-independent
  const teacherIndependenceScore = 0.9

  // Recall/replay scores: not directly tracked
  const recallScore = 0.5
  const replayScore = stabilityScore // Use stability as proxy

  // Noise risk: low if recurrence, stability, and source stability are high
  const noiseRisk = Math.max(
    0,
    1.0 -
      (recurrenceScore * 0.4 +
        stabilityScore * 0.3 +
        avgSourceStability * 0.3),
  )

  // Overall readiness
  const readinessScore =
    recurrenceScore * 0.3 +
    stabilityScore * 0.25 +
    avgSourceStability * 0.2 +
    labelConsistency * 0.15 +
    teacherIndependenceScore * 0.1

  // Determine recommendation
  let recommendedAction: SignalPromotionReadiness['recommendedAction'] = 'wait'

  if (readinessScore > 0.7 && noiseRisk < 0.3 && avgSourceStability > 0.6) {
    recommendedAction = 'candidate_for_mother_export'
    notes.push('High readiness, stable sources, low noise')
  } else if (readinessScore > 0.5) {
    recommendedAction = 'strengthen_personal'
    notes.push('Medium readiness, continue strengthening')
  } else {
    notes.push('Low readiness, needs more recurrence or stability')
  }

  if (noiseRisk > 0.6) {
    notes.push('WARNING: High noise risk')
  }

  if (avgSourceStability < 0.4) {
    notes.push('WARNING: Source assemblies are unstable')
  }

  return {
    targetId: protoSeed.protoSeedId,
    targetType: 'proto_seed',
    readinessScore,
    recurrenceScore,
    replayScore,
    recallScore,
    stabilityScore,
    teacherIndependenceScore,
    noiseRisk,
    recommendedAction,
    notes,
  }
}
