/**
 * Event Boundary Types
 *
 * Event boundaries segment continuous experience into discrete episodes,
 * affecting working memory updates and episodic memory structure.
 * This is NOT the same as signal boundary tension (runBoundaryLoop).
 */

export type EventBoundaryKind =
  | 'surprise'         // prediction error magnitude
  | 'goal_shift'       // goal/intent change
  | 'stance_shift'     // stance/attitude change
  | 'relation_shift'   // relational context change
  | 'somatic_shift'    // somatic state change
  | 'mixed'            // multiple factors

/**
 * Event boundary detection result
 */
export type EventBoundary = {
  /** Whether a boundary was detected */
  triggered: boolean
  /** Boundary score (0-1), higher means stronger boundary */
  score: number
  /** Reasons for boundary detection */
  reasons: string[]
  /** Primary kind of boundary detected */
  kind: EventBoundaryKind
}

/**
 * Input for event boundary detection
 */
export type EventBoundaryInput = {
  /** Prediction error magnitude (0-1) */
  predictionErrorMagnitude: number
  /** Goal shift detected (boolean or strength 0-1) */
  goalShift: number
  /** Stance shift detected (boolean or strength 0-1) */
  stanceShift: number
  /** Relation shift detected (boolean or strength 0-1) */
  relationShift: number
  /** Somatic shift detected (boolean or strength 0-1) */
  somaticShift: number
  /** Field intensity jump (current vs previous) */
  fieldIntensityJump: number
}

/**
 * Configuration for boundary detection thresholds
 */
export type BoundaryConfig = {
  /** Threshold for surprise-based boundaries */
  surpriseThreshold: number
  /** Threshold for goal shift boundaries */
  goalShiftThreshold: number
  /** Threshold for stance shift boundaries */
  stanceShiftThreshold: number
  /** Threshold for relation shift boundaries */
  relationShiftThreshold: number
  /** Threshold for somatic shift boundaries */
  somaticShiftThreshold: number
  /** Threshold for field intensity boundaries */
  fieldIntensityThreshold: number
  /** Overall boundary score threshold */
  overallThreshold: number
}

/**
 * Default boundary detection configuration
 */
export const DEFAULT_BOUNDARY_CONFIG: BoundaryConfig = {
  surpriseThreshold: 0.5,
  goalShiftThreshold: 0.4,
  stanceShiftThreshold: 0.4,
  relationShiftThreshold: 0.3,
  somaticShiftThreshold: 0.4,
  fieldIntensityThreshold: 0.35,
  overallThreshold: 0.3,
}
