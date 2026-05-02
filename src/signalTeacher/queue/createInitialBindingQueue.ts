import type { BindingQueueState } from './bindingQueueTypes'

export function createInitialBindingQueue(): BindingQueueState {
  return {
    items: [],
    pendingCount: 0,
    confirmedCount: 0,
    rejectedCount: 0,
    heldCount: 0,
  }
}
