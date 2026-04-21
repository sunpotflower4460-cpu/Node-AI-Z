import type { GuardianMode, GuardianReviewResult } from '../guardianTypes'
import type {
  PromotionStatus,
  PromotionValidationResult,
} from '../../promotion/promotionTypes'
import {
  findPromotionQueueEntry,
  updatePromotionQueueEntry,
} from '../../promotion/promotionQueue'
import {
  listGuardianReviewQueue,
  resolveGuardianReviewQueueEntry,
} from '../guardianReviewQueue'
import { guardianDecisionResolver } from '../guardianDecisionResolver'
import type {
  HumanReviewDecisionInput,
  HumanReviewRecord,
  HumanReviewSummary,
} from './humanReviewTypes'

const STORAGE_KEY = 'nodeaiz:guardian:human-review'

let humanReviewSummaries: HumanReviewSummary[] = []
let humanReviewRecords: HumanReviewRecord[] = []

export type HumanReviewEntry = {
  summary: HumanReviewSummary
  guardianMode: GuardianMode
  promotionStatus: PromotionStatus
  reviewStatus: 'pending' | 'resolved'
  record?: HumanReviewRecord
  guardianRequestId?: string
  guardianQueueEntryId?: string
  guardianResult?: GuardianReviewResult
}

const persistState = () => {
  if (typeof localStorage === 'undefined') return
  try {
    const payload = JSON.stringify({
      summaries: humanReviewSummaries,
      records: humanReviewRecords,
    })
    localStorage.setItem(STORAGE_KEY, payload)
  } catch (error) {
    console.warn('Failed to persist human review state', error)
  }
}

const hydrateFromStorage = () => {
  if (typeof localStorage === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const parsed = JSON.parse(stored) as {
      summaries?: HumanReviewSummary[]
      records?: HumanReviewRecord[]
    }
    humanReviewSummaries = Array.isArray(parsed.summaries) ? parsed.summaries : []
    humanReviewRecords = Array.isArray(parsed.records) ? parsed.records : []
  } catch (error) {
    console.warn('Failed to hydrate human review state', error)
  }
}

hydrateFromStorage()

const findGuardianContext = (candidateId: string) => {
  const guardianEntry = listGuardianReviewQueue().find(
    (entry) => entry.request.candidate.id === candidateId
  )
  const guardianMode = guardianEntry?.request.guardianMode ?? 'guardian_assisted'
  const validation: PromotionValidationResult | undefined = guardianEntry?.request.validation
  return { guardianEntry, guardianMode, validation }
}

const buildEntry = (summary: HumanReviewSummary): HumanReviewEntry => {
  const record = humanReviewRecords.find(
    (item) => item.candidateId === summary.candidateId
  )
  const { guardianEntry, guardianMode } = findGuardianContext(summary.candidateId)
  const promotionStatus =
    findPromotionQueueEntry(summary.candidateId)?.status ?? 'queued'

  return {
    summary,
    guardianMode,
    promotionStatus,
    reviewStatus: record ? 'resolved' : 'pending',
    record,
    guardianRequestId: guardianEntry?.request.id,
    guardianQueueEntryId: guardianEntry?.id,
    guardianResult: guardianEntry?.result,
  }
}

const upsertSummary = (summary: HumanReviewSummary) => {
  const index = humanReviewSummaries.findIndex(
    (existing) => existing.candidateId === summary.candidateId
  )
  if (index >= 0) {
    humanReviewSummaries[index] = {
      ...humanReviewSummaries[index],
      ...summary,
    }
  } else {
    humanReviewSummaries.push(summary)
  }
  persistState()
}

const upsertRecord = (record: HumanReviewRecord) => {
  const index = humanReviewRecords.findIndex(
    (existing) => existing.candidateId === record.candidateId
  )
  if (index >= 0) {
    humanReviewRecords[index] = record
  } else {
    humanReviewRecords.push(record)
  }
  persistState()
}

/**
 * Add or refresh a human review summary (pending entry).
 */
export const queueHumanReviewSummary = (summary: HumanReviewSummary) => {
  upsertSummary(summary)
  return summary
}

/**
 * List pending human review items with contextual metadata.
 */
export const listPendingHumanReviews = (): HumanReviewEntry[] => {
  return humanReviewSummaries
    .map(buildEntry)
    .filter((entry) => entry.reviewStatus === 'pending')
    .sort((a, b) => b.summary.createdAt - a.summary.createdAt)
}

/**
 * List resolved human review items with contextual metadata.
 */
export const listResolvedHumanReviews = (): HumanReviewEntry[] => {
  return humanReviewSummaries
    .map(buildEntry)
    .filter((entry) => entry.reviewStatus === 'resolved')
    .sort((a, b) => b.summary.createdAt - a.summary.createdAt)
}

const buildGuardianResultFromDecision = (
  summary: HumanReviewSummary | undefined,
  validation: PromotionValidationResult | undefined,
  guardianMode: GuardianMode,
  input: HumanReviewDecisionInput
): GuardianReviewResult => {
  return {
    requestId: findGuardianContext(input.candidateId).guardianEntry?.request.id
      ?? `human-review-${input.candidateId}`,
    actor: 'human_reviewer',
    decision: input.decision,
    confidence: summary?.confidenceScore ?? 0.8,
    reasons: [input.reason],
    cautionNotes: summary?.cautionNotes ?? [],
    createdAt: Date.now(),
    finalDecision:
      validation != null
        ? guardianDecisionResolver(validation, {
            requestId: `human-review-${input.candidateId}`,
            actor: 'human_reviewer',
            decision: input.decision,
            confidence: summary?.confidenceScore ?? 0.8,
            reasons: [input.reason],
            cautionNotes: summary?.cautionNotes ?? [],
            createdAt: Date.now(),
          }, guardianMode)
        : undefined,
  }
}

/**
 * Submit a human review decision and propagate it to guardian pipeline state.
 */
export const submitHumanReviewDecision = (
  input: HumanReviewDecisionInput
): { record: HumanReviewRecord; guardianResult: GuardianReviewResult } => {
  const summary = humanReviewSummaries.find(
    (item) => item.candidateId === input.candidateId
  )

  const { guardianEntry, guardianMode, validation } = findGuardianContext(
    input.candidateId
  )

  const guardianResult = buildGuardianResultFromDecision(
    summary,
    validation,
    guardianMode,
    input
  )

  if (guardianEntry) {
    resolveGuardianReviewQueueEntry(guardianEntry.id, guardianResult)
  }

  if (validation) {
    const decisionResult = guardianDecisionResolver(
      validation,
      guardianResult,
      guardianMode
    )
    const promotionEntry = findPromotionQueueEntry(input.candidateId)
    if (promotionEntry) {
      updatePromotionQueueEntry(promotionEntry.id, {
        status: decisionResult.finalStatus,
      })
    }
  }

  const record: HumanReviewRecord = {
    id: `human-review-record-${input.candidateId}-${Date.now()}`,
    candidateId: input.candidateId,
    actor: 'human_reviewer',
    decision: input.decision,
    reason: input.reason,
    createdAt: Date.now(),
  }

  upsertRecord(record)

  return { record, guardianResult }
}

/**
 * Resolve pending entries using stored decisions (helper for runtime restore).
 */
export const resolvePendingWithRecordedDecisions = () => {
  for (const record of humanReviewRecords) {
    const { guardianEntry, guardianMode, validation } = findGuardianContext(
      record.candidateId
    )
    const summary = humanReviewSummaries.find(
      (item) => item.candidateId === record.candidateId
    )
    if (!validation) continue

    const guardianResult = buildGuardianResultFromDecision(
      summary,
      validation,
      guardianMode,
      {
        candidateId: record.candidateId,
        decision: record.decision,
        reason: record.reason,
      }
    )
    resolveGuardianReviewQueueEntry(
      guardianEntry?.id ?? `guardian-entry-${record.candidateId}`,
      guardianResult
    )
    const promotionEntry = findPromotionQueueEntry(record.candidateId)
    if (promotionEntry) {
      const decisionResult = guardianDecisionResolver(
        validation,
        guardianResult,
        guardianMode
      )
      updatePromotionQueueEntry(promotionEntry.id, {
        status: decisionResult.finalStatus,
      })
    }
  }
}

export const getHumanReviewState = () => ({
  summaries: [...humanReviewSummaries],
  records: [...humanReviewRecords],
})

export const restoreHumanReviewState = (state: {
  summaries?: HumanReviewSummary[]
  records?: HumanReviewRecord[]
}) => {
  humanReviewSummaries = [...(state.summaries ?? [])]
  humanReviewRecords = [...(state.records ?? [])]
  persistState()
}

export const clearHumanReviewState = () => {
  humanReviewSummaries = []
  humanReviewRecords = []
  persistState()
}
