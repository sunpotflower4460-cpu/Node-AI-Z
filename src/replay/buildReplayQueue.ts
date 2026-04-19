/**
 * Build Replay Queue
 *
 * Selects episodic segments for offline replay based on:
 * - Boundary scores (segment boundaries)
 * - Surprise magnitude
 * - Unresolved tension
 * - Somatic salience
 *
 * Replay is NOT just re-displaying history - it's selective
 * reprocessing to update schema and personal learning.
 */

import type { SessionBrainState, EpisodicBufferEntry } from '../brain/sessionBrainState'
import type { EventBoundary } from '../boundary/boundaryTypes'

export type ReplayCandidate = {
  /** Episode entry from buffer */
  episode: EpisodicBufferEntry
  /** Priority score for replay (0-1) */
  priority: number
  /** Reasons for replay selection */
  reasons: string[]
}

export type ReplayQueue = {
  /** Candidates for replay, sorted by priority */
  candidates: ReplayCandidate[]
  /** Total candidates in queue */
  count: number
  /** Debug notes */
  debugNotes: string[]
}

/**
 * Build replay queue from episodic buffer and current state
 */
export const buildReplayQueue = (
  brainState: SessionBrainState,
  currentBoundary: EventBoundary | undefined,
  currentSurprise: number,
  maxCandidates = 3,
): ReplayQueue => {
  const debugNotes: string[] = []
  const candidates: ReplayCandidate[] = []

  // If no episodic buffer entries, return empty queue
  if (brainState.episodicBuffer.length === 0) {
    debugNotes.push('No episodic buffer entries for replay')
    return { candidates: [], count: 0, debugNotes }
  }

  // Process recent episodes (last 5 turns)
  const recentEpisodes = brainState.episodicBuffer.slice(-5)

  for (const episode of recentEpisodes) {
    const reasons: string[] = []
    let priority = 0.0

    // Factor 1: Recent boundary triggers replay of previous segments
    if (currentBoundary?.triggered) {
      priority += currentBoundary.score * 0.4
      reasons.push(`Boundary triggered: +${(currentBoundary.score * 0.4).toFixed(2)}`)
    }

    // Factor 2: Recent surprise increases replay priority
    if (currentSurprise > 0.3) {
      priority += currentSurprise * 0.3
      reasons.push(`Surprise: +${(currentSurprise * 0.3).toFixed(2)}`)
    }

    // Factor 3: Recent episodes have higher priority (recency)
    const recencyIndex = recentEpisodes.indexOf(episode)
    const recencyBonus = (recencyIndex / recentEpisodes.length) * 0.2
    priority += recencyBonus
    reasons.push(`Recency: +${recencyBonus.toFixed(2)}`)

    // Factor 4: Baseline priority for consolidation
    priority += 0.1

    // Only add if priority exceeds threshold
    if (priority > 0.2) {
      candidates.push({
        episode,
        priority,
        reasons,
      })
    }
  }

  // Sort by priority descending
  candidates.sort((a, b) => b.priority - a.priority)

  // Take top candidates
  const topCandidates = candidates.slice(0, maxCandidates)

  debugNotes.push(`Replay queue built: ${topCandidates.length} candidates from ${recentEpisodes.length} episodes`)
  if (topCandidates.length > 0) {
    debugNotes.push(
      `Top priorities: ${topCandidates.map((c) => c.priority.toFixed(2)).join(', ')}`
    )
  }

  return {
    candidates: topCandidates,
    count: topCandidates.length,
    debugNotes,
  }
}
