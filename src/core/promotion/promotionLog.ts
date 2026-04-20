/**
 * Promotion Log - Phase M10
 * Logs promotion pipeline events for visibility and debugging.
 */

import type { PromotionApprovalRecord, PromotionQueueEntry, PromotionApplyResult } from './promotionTypes'

export type PromotionLogEntry = {
  id: string
  timestamp: number
  eventType:
    | 'candidate_queued'
    | 'validation_finished'
    | 'candidate_quarantined'
    | 'candidate_rejected'
    | 'candidate_approved'
    | 'candidate_applied'
  candidateId: string
  details: string
  metadata?: Record<string, unknown>
}

/**
 * In-memory promotion log.
 * In a full implementation, this would be persisted.
 */
let promotionLog: PromotionLogEntry[] = []

/**
 * Log when a candidate is queued.
 */
export const logCandidateQueued = (entry: PromotionQueueEntry): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'candidate_queued',
    candidateId: entry.candidate.id,
    details: `Candidate queued: ${entry.candidate.type} (score=${entry.candidate.score.toFixed(2)})`,
    metadata: {
      candidateType: entry.candidate.type,
      score: entry.candidate.score,
      reinforcementCount: entry.candidate.reinforcementCount,
    },
  })
}

/**
 * Log when validation is finished.
 */
export const logValidationFinished = (
  candidateId: string,
  status: string,
  riskLevel: string,
  confidenceScore: number
): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'validation_finished',
    candidateId,
    details: `Validation finished: status=${status}, risk=${riskLevel}, confidence=${confidenceScore.toFixed(2)}`,
    metadata: {
      status,
      riskLevel,
      confidenceScore,
    },
  })
}

/**
 * Log when a candidate is quarantined.
 */
export const logCandidateQuarantined = (
  approvalRecord: PromotionApprovalRecord
): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'candidate_quarantined',
    candidateId: approvalRecord.candidateId,
    details: `Candidate quarantined: ${approvalRecord.reason}`,
    metadata: {
      actor: approvalRecord.actor,
      reason: approvalRecord.reason,
    },
  })
}

/**
 * Log when a candidate is rejected.
 */
export const logCandidateRejected = (
  approvalRecord: PromotionApprovalRecord
): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'candidate_rejected',
    candidateId: approvalRecord.candidateId,
    details: `Candidate rejected: ${approvalRecord.reason}`,
    metadata: {
      actor: approvalRecord.actor,
      reason: approvalRecord.reason,
    },
  })
}

/**
 * Log when a candidate is approved.
 */
export const logCandidateApproved = (
  approvalRecord: PromotionApprovalRecord
): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'candidate_approved',
    candidateId: approvalRecord.candidateId,
    details: `Candidate approved: ${approvalRecord.reason}`,
    metadata: {
      actor: approvalRecord.actor,
      reason: approvalRecord.reason,
    },
  })
}

/**
 * Log when a candidate is applied to trunk.
 */
export const logCandidateApplied = (applyResult: PromotionApplyResult): void => {
  promotionLog.push({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    eventType: 'candidate_applied',
    candidateId: applyResult.candidateId,
    details: `Candidate applied to trunk: ${applyResult.notes.join('; ')}`,
    metadata: {
      success: applyResult.success,
      trunkUpdated: applyResult.trunkUpdated,
      notes: applyResult.notes,
    },
  })
}

/**
 * Get all promotion log entries.
 */
export const getPromotionLog = (): PromotionLogEntry[] => {
  return [...promotionLog]
}

/**
 * Get promotion log entries for a specific candidate.
 */
export const getPromotionLogForCandidate = (
  candidateId: string
): PromotionLogEntry[] => {
  return promotionLog.filter((entry) => entry.candidateId === candidateId)
}

/**
 * Get promotion log entries of a specific event type.
 */
export const getPromotionLogByEventType = (
  eventType: PromotionLogEntry['eventType']
): PromotionLogEntry[] => {
  return promotionLog.filter((entry) => entry.eventType === eventType)
}

/**
 * Clear the promotion log.
 * Used for testing or reset purposes.
 */
export const clearPromotionLog = (): void => {
  promotionLog = []
}

/**
 * Get promotion log state for persistence.
 */
export const getPromotionLogState = (): PromotionLogEntry[] => {
  return [...promotionLog]
}

/**
 * Restore promotion log state from persistence.
 */
export const restorePromotionLogState = (entries: PromotionLogEntry[]): void => {
  promotionLog = [...entries]
}
