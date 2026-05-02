import type { BindingQueueState, BindingQueueItem } from './bindingQueueTypes'
import type { SameObjectBindingCandidate } from '../signalTeacherTypes'

export function enqueueBindingCandidate(
  queue: BindingQueueState,
  candidate: SameObjectBindingCandidate,
): BindingQueueState {
  const now = Date.now()
  const priority: BindingQueueItem['priority'] =
    candidate.source === 'user_pairing'
      ? 'high'
      : candidate.score.featureSimilarityScore > 0.6
        ? 'medium'
        : 'low'

  const item: BindingQueueItem = {
    id: `qi_${now}_${Math.random().toString(36).slice(2, 6)}`,
    candidateId: candidate.id,
    priority,
    status: 'pending',
    reason: `source:${candidate.source}`,
    createdAt: now,
    updatedAt: now,
  }

  return {
    ...queue,
    items: [...queue.items, item],
    pendingCount: queue.pendingCount + 1,
  }
}
