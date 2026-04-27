import type { SignalPromotionReadiness } from './signalPromotionReadinessTypes'
import type { SignalAssemblyRecord } from '../signalBranch/signalBranchTypes'

/**
 * Compute promotion readiness for an assembly.
 *
 * Evaluates:
 * - Recurrence count (how often it appears)
 * - Replay count (how well it consolidates)
 * - Stability score
 * - Noise risk (low recurrence + low stability = noise)
 */
export function computeAssemblyPromotionReadiness(
  assembly: SignalAssemblyRecord,
  isSuppressed: boolean = false,
): SignalPromotionReadiness {
  const notes: string[] = []

  // Recurrence score: how many times this assembly has appeared
  const recurrenceScore = Math.min(1.0, assembly.recurrenceCount / 10)

  // Replay score: how well it consolidates during rest
  const replayScore = Math.min(1.0, assembly.replayCount / 5)

  // Stability score: direct from assembly
  const stabilityScore = assembly.stabilityScore

  // Teacher independence: assemblies don't directly track teacher dependency
  const teacherIndependenceScore = 1.0 // Assumed independent for assemblies

  // Recall score: not directly applicable to assemblies
  const recallScore = 0.5 // Neutral

  // Noise risk: low if recurrence and stability are both high
  const noiseRisk = Math.max(
    0,
    1.0 - (recurrenceScore * 0.6 + stabilityScore * 0.4),
  )

  // Overall readiness: weighted combination
  const readinessScore =
    recurrenceScore * 0.3 +
    replayScore * 0.2 +
    stabilityScore * 0.3 +
    teacherIndependenceScore * 0.1 +
    recallScore * 0.1

  // Determine recommendation
  let recommendedAction: SignalPromotionReadiness['recommendedAction'] = 'wait'

  if (isSuppressed) {
    recommendedAction = 'wait'
    notes.push('Currently suppressed by competition')
  } else if (readinessScore > 0.7 && noiseRisk < 0.3) {
    recommendedAction = 'candidate_for_mother_export'
    notes.push('High readiness, low noise risk')
  } else if (readinessScore > 0.5) {
    recommendedAction = 'strengthen_personal'
    notes.push('Medium readiness, continue strengthening')
  } else {
    notes.push('Low readiness, needs more experience')
  }

  if (noiseRisk > 0.6) {
    notes.push('WARNING: High noise risk')
  }

  return {
    targetId: assembly.assemblyId,
    targetType: 'assembly',
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
