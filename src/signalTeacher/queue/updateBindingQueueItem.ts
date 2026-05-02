import type { BindingQueueState, BindingQueueItem } from './bindingQueueTypes'

function recalcCounts(items: BindingQueueItem[]): Pick<BindingQueueState, 'pendingCount' | 'confirmedCount' | 'rejectedCount' | 'heldCount'> {
  return {
    pendingCount: items.filter(i => i.status === 'pending' || i.status === 'checking').length,
    confirmedCount: items.filter(i => i.status === 'confirmed').length,
    rejectedCount: items.filter(i => i.status === 'rejected').length,
    heldCount: items.filter(i => i.status === 'held').length,
  }
}

export function updateBindingQueueItem(
  queue: BindingQueueState,
  itemId: string,
  update: Partial<Pick<BindingQueueItem, 'status' | 'reason'>>,
): BindingQueueState {
  const now = Date.now()
  const items = queue.items.map(item =>
    item.id === itemId ? { ...item, ...update, updatedAt: now } : item,
  )
  return { ...queue, items, ...recalcCounts(items) }
}
