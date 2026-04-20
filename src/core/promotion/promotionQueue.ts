/**
 * Promotion Queue - Phase M10
 * Manages the queue of promotion candidates waiting to be processed.
 */

import type { PromotionCandidate } from '../coreTypes'
import type { PromotionQueueEntry, PromotionStatus } from './promotionTypes'

/**
 * In-memory promotion queue.
 * In a full implementation, this would be persisted.
 */
let promotionQueue: PromotionQueueEntry[] = []

/**
 * Enqueue a promotion candidate.
 * Adds a new candidate to the promotion queue with 'queued' status.
 */
export const enqueuePromotionCandidate = (
  candidate: PromotionCandidate
): PromotionQueueEntry => {
  const entry: PromotionQueueEntry = {
    id: `queue-${candidate.id}-${Date.now()}`,
    candidate,
    status: 'queued',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  promotionQueue.push(entry)
  return entry
}

/**
 * List all promotion queue entries.
 * Optionally filter by status.
 */
export const listPromotionQueue = (
  filterStatus?: PromotionStatus
): PromotionQueueEntry[] => {
  if (filterStatus) {
    return promotionQueue.filter((entry) => entry.status === filterStatus)
  }
  return [...promotionQueue]
}

/**
 * Update a promotion queue entry.
 * Returns the updated entry, or undefined if not found.
 */
export const updatePromotionQueueEntry = (
  entryId: string,
  updates: Partial<Omit<PromotionQueueEntry, 'id' | 'createdAt'>>
): PromotionQueueEntry | undefined => {
  const index = promotionQueue.findIndex((entry) => entry.id === entryId)
  if (index === -1) return undefined

  promotionQueue[index] = {
    ...promotionQueue[index],
    ...updates,
    updatedAt: Date.now(),
  }

  return promotionQueue[index]
}

/**
 * Find a promotion queue entry by candidate ID.
 */
export const findPromotionQueueEntry = (
  candidateId: string
): PromotionQueueEntry | undefined => {
  return promotionQueue.find((entry) => entry.candidate.id === candidateId)
}

/**
 * Clear promotion entries that have been applied.
 * Removes entries with 'applied' status to keep the queue clean.
 */
export const clearAppliedPromotionEntries = (): number => {
  const beforeLength = promotionQueue.length
  promotionQueue = promotionQueue.filter((entry) => entry.status !== 'applied')
  return beforeLength - promotionQueue.length
}

/**
 * Get promotion queue state for persistence.
 * Returns the current queue as a plain array.
 */
export const getPromotionQueueState = (): PromotionQueueEntry[] => {
  return [...promotionQueue]
}

/**
 * Restore promotion queue state from persistence.
 */
export const restorePromotionQueueState = (
  entries: PromotionQueueEntry[]
): void => {
  promotionQueue = [...entries]
}

/**
 * Clear the entire promotion queue.
 * Used for testing or reset purposes.
 */
export const clearPromotionQueue = (): void => {
  promotionQueue = []
}
