/**
 * Event Boundary Detection
 *
 * Detects meaningful transitions in experience based on multiple factors:
 * - Prediction error (surprise)
 * - Goal/intent shifts
 * - Stance/attitude changes
 * - Relational context changes
 * - Somatic state changes
 * - Field intensity jumps
 *
 * When a boundary is detected, it should causally affect:
 * - Workspace flush/reframe
 * - Episodic segment creation
 * - Replay queue insertion
 * - Learning rate adjustment
 * - Confidence recalculation
 */

import type {
  EventBoundary,
  EventBoundaryInput,
  EventBoundaryKind,
  BoundaryConfig,
} from './boundaryTypes'
import { DEFAULT_BOUNDARY_CONFIG } from './boundaryTypes'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/**
 * Detect event boundary from multiple input signals
 */
export const detectEventBoundary = (
  input: EventBoundaryInput,
  config: BoundaryConfig = DEFAULT_BOUNDARY_CONFIG,
): EventBoundary => {
  const reasons: string[] = []
  let maxScore = 0
  let primaryKind: EventBoundaryKind = 'mixed'

  // Check each dimension against its threshold
  const surpriseScore = clamp(input.predictionErrorMagnitude, 0, 1)
  if (surpriseScore >= config.surpriseThreshold) {
    reasons.push(`Surprise: ${surpriseScore.toFixed(2)} >= ${config.surpriseThreshold}`)
    if (surpriseScore > maxScore) {
      maxScore = surpriseScore
      primaryKind = 'surprise'
    }
  }

  const goalScore = clamp(input.goalShift, 0, 1)
  if (goalScore >= config.goalShiftThreshold) {
    reasons.push(`Goal shift: ${goalScore.toFixed(2)} >= ${config.goalShiftThreshold}`)
    if (goalScore > maxScore) {
      maxScore = goalScore
      primaryKind = 'goal_shift'
    }
  }

  const stanceScore = clamp(input.stanceShift, 0, 1)
  if (stanceScore >= config.stanceShiftThreshold) {
    reasons.push(`Stance shift: ${stanceScore.toFixed(2)} >= ${config.stanceShiftThreshold}`)
    if (stanceScore > maxScore) {
      maxScore = stanceScore
      primaryKind = 'stance_shift'
    }
  }

  const relationScore = clamp(input.relationShift, 0, 1)
  if (relationScore >= config.relationShiftThreshold) {
    reasons.push(`Relation shift: ${relationScore.toFixed(2)} >= ${config.relationShiftThreshold}`)
    if (relationScore > maxScore) {
      maxScore = relationScore
      primaryKind = 'relation_shift'
    }
  }

  const somaticScore = clamp(input.somaticShift, 0, 1)
  if (somaticScore >= config.somaticShiftThreshold) {
    reasons.push(`Somatic shift: ${somaticScore.toFixed(2)} >= ${config.somaticShiftThreshold}`)
    if (somaticScore > maxScore) {
      maxScore = somaticScore
      primaryKind = 'somatic_shift'
    }
  }

  const fieldJumpScore = clamp(input.fieldIntensityJump, 0, 1)
  if (fieldJumpScore >= config.fieldIntensityThreshold) {
    reasons.push(`Field intensity jump: ${fieldJumpScore.toFixed(2)} >= ${config.fieldIntensityThreshold}`)
    if (fieldJumpScore > maxScore) {
      maxScore = fieldJumpScore
      // Field jump doesn't change primaryKind unless it's the only factor
      if (reasons.length === 1) {
        primaryKind = 'mixed'
      }
    }
  }

  // Determine if multiple factors contributed
  if (reasons.length > 1) {
    primaryKind = 'mixed'
  }

  // Overall score is the maximum of all contributing factors
  const overallScore = maxScore

  // Boundary is triggered if overall score exceeds threshold
  const triggered = overallScore >= config.overallThreshold && reasons.length > 0

  return {
    triggered,
    score: overallScore,
    reasons,
    kind: primaryKind,
  }
}

/**
 * Apply boundary effects to runtime state
 * This determines what happens when a boundary is detected
 */
export type BoundaryEffect = {
  /** Should flush/reframe workspace */
  shouldFlushWorkspace: boolean
  /** Should create new episodic segment */
  shouldCreateSegment: boolean
  /** Should add to replay queue */
  shouldQueueReplay: boolean
  /** Learning rate adjustment factor (1.0 = no change) */
  learningRateAdjustment: number
  /** Should trigger confidence recalculation */
  shouldRecalculateConfidence: boolean
}

/**
 * Compute effects from boundary detection
 */
export const computeBoundaryEffects = (
  boundary: EventBoundary,
): BoundaryEffect => {
  if (!boundary.triggered) {
    return {
      shouldFlushWorkspace: false,
      shouldCreateSegment: false,
      shouldQueueReplay: false,
      learningRateAdjustment: 1.0,
      shouldRecalculateConfidence: false,
    }
  }

  // Strong boundaries (score > 0.6) trigger more effects
  const isStrong = boundary.score > 0.6

  // Goal shifts and surprises flush workspace more aggressively
  const shouldFlushWorkspace =
    boundary.kind === 'goal_shift' ||
    boundary.kind === 'surprise' ||
    isStrong

  // All boundaries create new segments
  const shouldCreateSegment = true

  // Strong boundaries and certain kinds queue for replay
  const shouldQueueReplay =
    isStrong ||
    boundary.kind === 'surprise' ||
    boundary.kind === 'goal_shift'

  // Learning rate increases at boundaries to capture new context
  // Stronger boundaries = higher learning rate
  const learningRateAdjustment = 1.0 + (boundary.score * 0.3)

  // All boundaries trigger confidence recalculation
  const shouldRecalculateConfidence = true

  return {
    shouldFlushWorkspace,
    shouldCreateSegment,
    shouldQueueReplay,
    learningRateAdjustment,
    shouldRecalculateConfidence,
  }
}
