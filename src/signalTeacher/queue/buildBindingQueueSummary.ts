import type { BindingQueueState } from './bindingQueueTypes'

export function buildBindingQueueSummary(queue: BindingQueueState): {
  pendingCount: number
  confirmedCount: number
  rejectedCount: number
  heldCount: number
  highPriorityCount: number
  notes: string[]
} {
  const highPriorityCount = queue.items.filter(i => i.priority === 'high').length
  const notes: string[] = []
  if (highPriorityCount > 0) notes.push(`high_priority:${highPriorityCount}`)

  return {
    pendingCount: queue.pendingCount,
    confirmedCount: queue.confirmedCount,
    rejectedCount: queue.rejectedCount,
    heldCount: queue.heldCount,
    highPriorityCount,
    notes,
  }
}
