/**
 * Promotion Log Tests - Phase M10
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  logCandidateQueued,
  logValidationFinished,
  logCandidateQuarantined,
  logCandidateRejected,
  logCandidateApproved,
  logCandidateApplied,
  getPromotionLog,
  getPromotionLogForCandidate,
  getPromotionLogByEventType,
  clearPromotionLog,
  getPromotionLogState,
  restorePromotionLogState,
} from '../promotionLog'
import type { PromotionQueueEntry, PromotionApprovalRecord, PromotionApplyResult } from '../promotionTypes'
import { createEmptySharedTrunk } from '../../sharedTrunk'

describe('Promotion Log', () => {
  beforeEach(() => {
    clearPromotionLog()
  })

  it('should log candidate queued event', () => {
    const entry: PromotionQueueEntry = {
      id: 'entry-1',
      candidate: {
        id: 'candidate-1',
        type: 'schema',
        sourceData: {} as Record<string, number>,
        score: 0.8,
        reasons: [],
        firstIdentifiedAt: Date.now(),
        reinforcementCount: 5,
        approved: false,
        rejected: false,
      },
      status: 'queued',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    logCandidateQueued(entry)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('candidate_queued')
    expect(log[0]?.candidateId).toBe('candidate-1')
  })

  it('should log validation finished event', () => {
    logValidationFinished('candidate-1', 'validated', 'medium', 0.65)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('validation_finished')
    expect(log[0]?.details).toContain('validated')
    expect(log[0]?.details).toContain('medium')
  })

  it('should log candidate quarantined event', () => {
    const approvalRecord: PromotionApprovalRecord = {
      id: 'approval-1',
      candidateId: 'candidate-1',
      decision: 'quarantine',
      reason: 'Needs more evidence',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateQuarantined(approvalRecord)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('candidate_quarantined')
  })

  it('should log candidate rejected event', () => {
    const approvalRecord: PromotionApprovalRecord = {
      id: 'approval-2',
      candidateId: 'candidate-2',
      decision: 'reject',
      reason: 'High risk',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateRejected(approvalRecord)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('candidate_rejected')
  })

  it('should log candidate approved event', () => {
    const approvalRecord: PromotionApprovalRecord = {
      id: 'approval-3',
      candidateId: 'candidate-3',
      decision: 'approve',
      reason: 'Low risk, high confidence',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateApproved(approvalRecord)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('candidate_approved')
  })

  it('should log candidate applied event', () => {
    const applyResult: PromotionApplyResult = {
      success: true,
      candidateId: 'candidate-4',
      trunkUpdated: true,
      notes: ['Added new schema to trunk'],
      nextTrunk: createEmptySharedTrunk(),
    }

    logCandidateApplied(applyResult)

    const log = getPromotionLog()
    expect(log).toHaveLength(1)
    expect(log[0]?.eventType).toBe('candidate_applied')
  })

  it('should get logs for specific candidate', () => {
    const approvalRecord1: PromotionApprovalRecord = {
      id: 'approval-1',
      candidateId: 'candidate-1',
      decision: 'approve',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    const approvalRecord2: PromotionApprovalRecord = {
      id: 'approval-2',
      candidateId: 'candidate-2',
      decision: 'reject',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateApproved(approvalRecord1)
    logCandidateRejected(approvalRecord2)

    const candidate1Logs = getPromotionLogForCandidate('candidate-1')
    expect(candidate1Logs).toHaveLength(1)
    expect(candidate1Logs[0]?.candidateId).toBe('candidate-1')
  })

  it('should get logs by event type', () => {
    const approvalRecord1: PromotionApprovalRecord = {
      id: 'approval-1',
      candidateId: 'candidate-1',
      decision: 'approve',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    const approvalRecord2: PromotionApprovalRecord = {
      id: 'approval-2',
      candidateId: 'candidate-2',
      decision: 'approve',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    const approvalRecord3: PromotionApprovalRecord = {
      id: 'approval-3',
      candidateId: 'candidate-3',
      decision: 'reject',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateApproved(approvalRecord1)
    logCandidateApproved(approvalRecord2)
    logCandidateRejected(approvalRecord3)

    const approvedLogs = getPromotionLogByEventType('candidate_approved')
    const rejectedLogs = getPromotionLogByEventType('candidate_rejected')

    expect(approvedLogs).toHaveLength(2)
    expect(rejectedLogs).toHaveLength(1)
  })

  it('should save and restore log state', () => {
    const approvalRecord: PromotionApprovalRecord = {
      id: 'approval-1',
      candidateId: 'candidate-1',
      decision: 'approve',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateApproved(approvalRecord)
    const state = getPromotionLogState()

    clearPromotionLog()
    expect(getPromotionLog()).toHaveLength(0)

    restorePromotionLogState(state)
    expect(getPromotionLog()).toHaveLength(1)
  })

  it('should create log entries with all required fields', () => {
    const approvalRecord: PromotionApprovalRecord = {
      id: 'approval-1',
      candidateId: 'candidate-1',
      decision: 'approve',
      reason: 'Test',
      createdAt: Date.now(),
      actor: 'system',
    }

    logCandidateApproved(approvalRecord)

    const log = getPromotionLog()
    const entry = log[0]!

    expect(entry.id).toBeTruthy()
    expect(entry.timestamp).toBeTruthy()
    expect(entry.eventType).toBe('candidate_approved')
    expect(entry.candidateId).toBe('candidate-1')
    expect(entry.details).toBeTruthy()
  })
})
