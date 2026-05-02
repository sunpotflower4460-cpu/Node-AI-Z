import type { UiReviewSession } from '../uiReviewLoopTypes'

export type UiReviewStorageAdapter = {
  save(sessions: UiReviewSession[]): void
  load(): UiReviewSession[]
  clear(): void
}

const STORAGE_KEY = 'ui_review_history_v1'

export const localStorageAdapter: UiReviewStorageAdapter = {
  save(sessions: UiReviewSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch {
      // storage unavailable — silently skip
    }
  },

  load(): UiReviewSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed as UiReviewSession[]
    } catch {
      return []
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable — silently skip
    }
  },
}
