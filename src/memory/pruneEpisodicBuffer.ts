/**
 * Prune Episodic Buffer
 * Phase M4: Manages episodic buffer size and quality.
 *
 * The episodic buffer should not grow unbounded. This module prunes
 * low-salience, old, or already-consolidated traces while preserving
 * important unresolved experiences.
 */

import type { EpisodicTrace } from './types'

export type PruneEpisodicBufferInput = {
  /** Current episodic buffer */
  buffer: EpisodicTrace[]

  /** Maximum buffer size (default: 15) */
  maxSize?: number

  /** Current turn number */
  currentTurn: number
}

/**
 * Computes a retention score for each trace.
 * Higher score = more likely to be kept.
 */
const computeRetentionScore = (trace: EpisodicTrace, currentTurn: number): number => {
  let score = trace.salience // Start with base salience

  // Recently created traces get a boost
  const age = currentTurn - trace.createdAtTurn
  if (age < 2) {
    score += 0.3 // Recent bonus
  } else if (age < 5) {
    score += 0.1 // Moderately recent bonus
  }

  // Unresolved tensions boost retention
  if (trace.unresolvedTensionKeys.length > 0) {
    score += 0.2
  }

  // Not yet consolidated traces are more valuable
  if (!trace.consolidated) {
    score += 0.15
  } else {
    // Consolidated but with low salience can be pruned more easily
    if (trace.salience < 0.4) {
      score -= 0.3
    }
  }

  // Already replayed many times? Less need to keep
  if (trace.replayCount > 3) {
    score -= 0.1
  }

  return Math.max(score, 0.0)
}

/**
 * Prunes the episodic buffer to keep only the most valuable traces.
 * Removes low-salience, old, and consolidated traces first.
 */
export const pruneEpisodicBuffer = (input: PruneEpisodicBufferInput): EpisodicTrace[] => {
  const { buffer, maxSize = 15, currentTurn } = input

  // If buffer is under limit, no pruning needed
  if (buffer.length <= maxSize) {
    return buffer
  }

  // Score each trace
  const scored = buffer.map((trace) => ({
    trace,
    score: computeRetentionScore(trace, currentTurn),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Keep top maxSize traces
  const pruned = scored.slice(0, maxSize).map((item) => item.trace)

  return pruned
}
