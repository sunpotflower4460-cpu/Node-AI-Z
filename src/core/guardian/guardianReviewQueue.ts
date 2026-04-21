/**
 * Guardian Review Queue - Phase M11
 * Manages the queue of guardian review requests.
 */

import type {
  GuardianReviewRequest,
  GuardianReviewQueueEntry,
  GuardianReviewResult,
} from './guardianTypes'

/**
 * In-memory guardian review queue.
 * In a full implementation, this would be persisted.
 */
let guardianReviewQueue: GuardianReviewQueueEntry[] = []

/**
 * Enqueue a guardian review request.
 * Adds a new request to the guardian review queue.
 */
export const enqueueGuardianReview = (
  request: GuardianReviewRequest
): GuardianReviewQueueEntry => {
  const entry: GuardianReviewQueueEntry = {
    id: `guardian-queue-${request.id}-${Date.now()}`,
    request,
    status: 'queued',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  guardianReviewQueue.push(entry)
  return entry
}

/**
 * List all guardian review queue entries.
 * Optionally filter by status.
 */
export const listGuardianReviewQueue = (
  filterStatus?: 'queued' | 'resolved' | 'expired'
): GuardianReviewQueueEntry[] => {
  if (filterStatus) {
    return guardianReviewQueue.filter((entry) => entry.status === filterStatus)
  }
  return [...guardianReviewQueue]
}

/**
 * Update a guardian review queue entry.
 * Returns the updated entry, or undefined if not found.
 */
export const updateGuardianReviewQueueEntry = (
  entryId: string,
  updates: Partial<Omit<GuardianReviewQueueEntry, 'id' | 'createdAt'>>
): GuardianReviewQueueEntry | undefined => {
  const index = guardianReviewQueue.findIndex((entry) => entry.id === entryId)
  if (index === -1) return undefined

  guardianReviewQueue[index] = {
    ...guardianReviewQueue[index],
    ...updates,
    updatedAt: Date.now(),
  }

  return guardianReviewQueue[index]
}

/**
 * Resolve a guardian review queue entry with a result.
 */
export const resolveGuardianReviewQueueEntry = (
  entryId: string,
  result: GuardianReviewResult
): GuardianReviewQueueEntry | undefined => {
  return updateGuardianReviewQueueEntry(entryId, {
    status: 'resolved',
    result,
  })
}

/**
 * Find a guardian review queue entry by request ID.
 */
export const findGuardianReviewQueueEntry = (
  requestId: string
): GuardianReviewQueueEntry | undefined => {
  return guardianReviewQueue.find((entry) => entry.request.id === requestId)
}

/**
 * Clear resolved guardian review entries.
 * Removes entries with 'resolved' status to keep the queue clean.
 */
export const clearResolvedGuardianEntries = (): number => {
  const beforeLength = guardianReviewQueue.length
  guardianReviewQueue = guardianReviewQueue.filter(
    (entry) => entry.status !== 'resolved'
  )
  return beforeLength - guardianReviewQueue.length
}

/**
 * Get guardian review queue state for persistence.
 * Returns the current queue as a plain array.
 */
export const getGuardianReviewQueueState = (): GuardianReviewQueueEntry[] => {
  return [...guardianReviewQueue]
}

/**
 * Restore guardian review queue state from persistence.
 */
export const restoreGuardianReviewQueueState = (
  entries: GuardianReviewQueueEntry[]
): void => {
  guardianReviewQueue = [...entries]
}

/**
 * Clear the entire guardian review queue.
 * Used for testing or reset purposes.
 */
export const clearGuardianReviewQueue = (): void => {
  guardianReviewQueue = []
}
