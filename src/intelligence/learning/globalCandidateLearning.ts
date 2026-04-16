import type { GlobalCandidateState, GlobalLearningCandidate, PathwayStrengthMap } from './types'

/** Maximum number of candidates retained in the pool */
const MAX_CANDIDATES = 200
/**
 * Minimum session strength required before nominating a key as a global candidate.
 * Prevents transient one-off activations from polluting the global pool.
 */
const NOMINATION_THRESHOLD = 0.3

/**
 * Create a blank global candidate state.
 */
export const createGlobalCandidateState = (): GlobalCandidateState => ({
  candidates: [],
  lastUpdated: new Date().toISOString(),
})

/**
 * Nominate pathway keys as global weight update candidates.
 *
 * Only keys whose session strength has crossed NOMINATION_THRESHOLD are added,
 * ensuring only repeatedly-reinforced pathways reach the global pool.
 * Oldest candidates are evicted when the pool exceeds MAX_CANDIDATES.
 */
export const updateGlobalCandidates = (
  state: GlobalCandidateState,
  firedKeys: string[],
  sessionStrengths: PathwayStrengthMap,
  sessionId: string,
): GlobalCandidateState => {
  const now = new Date().toISOString()
  const newCandidates: GlobalLearningCandidate[] = []

  for (const key of firedKeys) {
    const strength = sessionStrengths[key] ?? 0
    if (strength >= NOMINATION_THRESHOLD) {
      newCandidates.push({
        key,
        delta: strength * 0.1,
        reason: `session_reinforced:${strength.toFixed(2)}`,
        sessionId,
        timestamp: now,
      })
    }
  }

  if (newCandidates.length === 0) return state

  const merged = [...state.candidates, ...newCandidates]
  const trimmed = merged.length > MAX_CANDIDATES
    ? merged.slice(merged.length - MAX_CANDIDATES)
    : merged

  return { candidates: trimmed, lastUpdated: now }
}
