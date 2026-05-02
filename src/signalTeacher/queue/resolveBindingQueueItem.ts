import type { BindingQueueState } from './bindingQueueTypes'
import { updateBindingQueueItem } from './updateBindingQueueItem'

export function resolveBindingQueueItem(
  queue: BindingQueueState,
  itemId: string,
  resolution: 'confirmed' | 'rejected' | 'held',
): BindingQueueState {
  return updateBindingQueueItem(queue, itemId, { status: resolution })
}
