import type { SignalPromotionReadiness } from './signalPromotionReadinessTypes'
import type { SignalBridgeRecord } from '../signalBranch/signalBranchTypes'

/**
 * Compute promotion readiness for a bridge.
 *
 * Evaluates:
 * - Stage (tentative < reinforced < teacher_light < teacher_free < promoted)
 * - Teacher dependency score (lower is better)
 * - Recall success score (higher is better)
 * - Failed recall count (lower is better)
 * - Confidence
 */
export function computeBridgePromotionReadiness(
  bridge: SignalBridgeRecord,
): SignalPromotionReadiness {
  const notes: string[] = []

  // Stage score: higher stages are more ready
  const stageScores = {
    tentative: 0.1,
    reinforced: 0.3,
    teacher_light: 0.5,
    teacher_free: 0.8,
    promoted: 1.0,
  }
  const stageScore = stageScores[bridge.stage]

  // Teacher independence: inverse of dependency
  const teacherIndependenceScore = 1.0 - bridge.teacherDependencyScore

  // Recall score: direct from bridge
  const recallScore = bridge.recallSuccessScore

  // Confidence score
  const confidenceScore = bridge.confidence

  // Recurrence score: number of successful recalls
  const recurrenceScore = Math.min(1.0, bridge.selfRecallSuccessCount / 5)

  // Stability: combination of confidence and stage
  const stabilityScore = (confidenceScore + stageScore) / 2

  // Noise risk: high if many failed recalls or low confidence
  const failureRatio =
    bridge.failedRecallCount / Math.max(1, bridge.selfRecallSuccessCount + bridge.failedRecallCount)
  const noiseRisk = Math.max(
    0,
    failureRatio * 0.5 + (1.0 - confidenceScore) * 0.3 + bridge.teacherDependencyScore * 0.2,
  )

  // Replay score: not directly tracked for bridges
  const replayScore = recallScore // Use recall as proxy

  // Overall readiness
  const readinessScore =
    stageScore * 0.25 +
    teacherIndependenceScore * 0.25 +
    recallScore * 0.2 +
    confidenceScore * 0.15 +
    recurrenceScore * 0.15

  // Determine recommendation
  let recommendedAction: SignalPromotionReadiness['recommendedAction'] = 'wait'

  if (bridge.stage === 'promoted') {
    recommendedAction = 'candidate_for_mother_export'
    notes.push('Already promoted stage')
  } else if (
    bridge.stage === 'teacher_free' &&
    readinessScore > 0.7 &&
    noiseRisk < 0.3
  ) {
    recommendedAction = 'candidate_for_mother_export'
    notes.push('Teacher-free, high readiness, low noise')
  } else if (readinessScore > 0.5 && bridge.teacherDependencyScore > 0.5) {
    recommendedAction = 'wait'
    notes.push('Still dependent on teacher, needs more self-recall success')
  } else if (readinessScore > 0.4) {
    recommendedAction = 'strengthen_personal'
    notes.push('Medium readiness, continue building')
  } else {
    notes.push('Low readiness or high teacher dependency')
  }

  if (noiseRisk > 0.6) {
    notes.push('WARNING: High noise risk (many failed recalls)')
  }

  return {
    targetId: bridge.id,
    targetType: 'bridge',
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
