/**
 * Guardian Types - Phase M11
 * Types for guardian layer that reviews and approves promotions to shared trunk.
 * Enables AI sensei or human review to be inserted into promotion pipeline.
 */

import type { PromotionCandidate } from '../coreTypes'
import type { PromotionValidationResult } from '../promotion/promotionTypes'

/**
 * Guardian Mode
 * Determines how guardian review is handled.
 */
export type GuardianMode =
  | 'system_only' // System validation alone (like M10)
  | 'guardian_assisted' // Guardian review requested if available
  | 'human_required' // Human review explicitly required

/**
 * Guardian Actor
 * Who made the guardian decision.
 */
export type GuardianActor = 'system' | 'ai_sensei' | 'human_reviewer'

/**
 * Guardian Decision
 * The decision made by the guardian.
 */
export type GuardianDecision =
  | 'approve' // Allow promotion to trunk
  | 'reject' // Deny promotion
  | 'quarantine' // Hold for more evidence
  | 'hold_for_review' // Hold until guardian can review

/**
 * Guardian Review Request
 * Request for guardian to review a promotion candidate.
 */
export type GuardianReviewRequest = {
  /** Unique identifier for this request */
  id: string

  /** The candidate to review */
  candidate: PromotionCandidate

  /** Validation result from system validation */
  validation: PromotionValidationResult

  /** When this request was created */
  requestedAt: number

  /** Guardian mode for this request */
  guardianMode: GuardianMode

  /** Summary of key points for guardian to review */
  summary: string[]

  /** Caution notes to highlight potential issues */
  cautionNotes: string[]
}

/**
 * Guardian Review Result
 * Result of guardian review.
 */
export type GuardianReviewResult = {
  /** ID of the request this result is for */
  requestId: string

  /** Who made this decision */
  actor: GuardianActor

  /** The decision made */
  decision: GuardianDecision

  /** Confidence in this decision (0.0 - 1.0) */
  confidence: number

  /** Reasons for this decision */
  reasons: string[]

  /** Additional caution notes */
  cautionNotes: string[]

  /** When this result was created */
  createdAt: number
}

/**
 * Guardian Review Queue Entry
 * Tracks a guardian review request in the queue.
 */
export type GuardianReviewQueueEntry = {
  /** Unique identifier for this queue entry */
  id: string

  /** The review request */
  request: GuardianReviewRequest

  /** Current status of this entry */
  status: 'queued' | 'resolved' | 'expired'

  /** Result (if resolved) */
  result?: GuardianReviewResult

  /** When this entry was created */
  createdAt: number

  /** When this entry was last updated */
  updatedAt: number
}

/**
 * Guardian Policy
 * Configuration for how guardian review is handled.
 */
export type GuardianPolicy = {
  /** Default guardian mode */
  mode: GuardianMode

  /** Auto-approve low risk candidates */
  autoApproveLowRisk: boolean

  /** Require guardian for medium risk */
  requireGuardianForMediumRisk: boolean

  /** Require human for high risk */
  requireHumanForHighRisk: boolean
}
