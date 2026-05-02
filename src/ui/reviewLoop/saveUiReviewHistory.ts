import type { UiReviewSession } from './uiReviewLoopTypes'
import type { UiReviewStorageAdapter } from './storage/uiReviewStorageAdapter'
import { localStorageAdapter } from './storage/uiReviewStorageAdapter'

export const saveUiReviewHistory = (
  session: UiReviewSession,
  adapter: UiReviewStorageAdapter = localStorageAdapter,
): void => {
  const existing = adapter.load()
  const idx = existing.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    existing[idx] = session
  } else {
    existing.push(session)
  }
  adapter.save(existing)
}
