/**
 * Promotion Types - Phase M10
 * Types for safe promotion pipeline from Personal Branch to Shared Trunk.
 * Candidates go through: queued → validated → quarantined/rejected/approved → applied
 */

import type { PromotionCandidate, SharedTrunkState } from '../coreTypes'

/**
 * Promotion Status
 * Tracks the current state of a promotion candidate in the pipeline.
 */
export type PromotionStatus =
  | 'queued' // Initial state: candidate is waiting for validation
  | 'validated' // Validation completed, awaiting decision
  | 'quarantined' // On hold: needs more evidence or time
  | 'rejected' // Rejected: not suitable for trunk
  | 'approved' // Approved: ready to be applied to trunk
  | 'applied' // Applied: already promoted to trunk

/**
 * Promotion Risk Level
 * Indicates how risky this promotion is (based on stability, recurrence, etc.)
 */
export type PromotionRiskLevel = 'low' | 'medium' | 'high'

/**
 * Promotion Validation Result
 * Result of validating a promotion candidate.
 */
export type PromotionValidationResult = {
  /** ID of the candidate being validated */
  candidateId: string

  /** Resulting status after validation */
  status: PromotionStatus

  /** Risk level assigned to this candidate */
  riskLevel: PromotionRiskLevel

  /** Confidence score (0.0 - 1.0) for this validation */
  confidenceScore: number

  /** Reasons supporting this validation result */
  reasons: string[]

  /** Caution notes about potential issues */
  cautionNotes: string[]
}

/**
 * Promotion Queue Entry
 * Represents a candidate in the promotion queue.
 */
export type PromotionQueueEntry = {
  /** Unique identifier for this queue entry */
  id: string

  /** The promotion candidate */
  candidate: PromotionCandidate

  /** Current status in the pipeline */
  status: PromotionStatus

  /** Validation result (if validation has been performed) */
  validation?: PromotionValidationResult

  /** When this entry was created */
  createdAt: number

  /** When this entry was last updated */
  updatedAt: number
}

/**
 * Promotion Approval Record
 * Records the decision made about a promotion candidate.
 */
export type PromotionApprovalRecord = {
  /** Unique identifier for this approval record */
  id: string

  /** ID of the candidate this decision is about */
  candidateId: string

  /** The decision made */
  decision: 'approve' | 'reject' | 'quarantine'

  /** Reason for this decision */
  reason: string

  /** When this decision was made */
  createdAt: number

  /** Who/what made this decision (system auto, future guardian, future human) */
  actor: 'system' | 'future_guardian' | 'future_human_review'
}

/**
 * Promotion Apply Result
 * Result of applying an approved promotion to the trunk.
 */
export type PromotionApplyResult = {
  /** Whether the application was successful */
  success: boolean

  /** ID of the candidate that was applied */
  candidateId: string

  /** Whether the trunk was actually updated */
  trunkUpdated: boolean

  /** Notes about what happened during application */
  notes: string[]

  /** The updated trunk state (if successful) */
  nextTrunk: SharedTrunkState
}
