import type { UiReviewSession } from './uiReviewLoopTypes'
import type { UiReviewStorageAdapter } from './storage/uiReviewStorageAdapter'
import { localStorageAdapter } from './storage/uiReviewStorageAdapter'

export const loadUiReviewHistory = (
  adapter: UiReviewStorageAdapter = localStorageAdapter,
): UiReviewSession[] => {
  return adapter.load().sort((a, b) => b.createdAt - a.createdAt)
}
