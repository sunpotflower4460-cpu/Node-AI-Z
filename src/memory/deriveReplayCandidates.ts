/**
 * Derive Replay Candidates
 * Phase M4: Selects episodic traces for replay/consolidation.
 *
 * Not all traces deserve replay. This module scores traces based on:
 * - Salience (importance)
 * - Unresolved tensions
 * - Replay count (prefer less-replayed)
 * - Resonance with current workspace/afterglow
 */

import type { EpisodicTrace, ReplayCandidate } from './types'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'

export type DeriveReplayCandidatesInput = {
  /** Episodic buffer to select from */
  episodicBuffer: EpisodicTrace[]

  /** Current workspace state */
  workspace: WorkspaceState

  /** Afterglow from previous turn */
  afterglow: number

  /** Recent field intensity */
  recentFieldIntensity: number

  /** Current turn number */
  currentTurn: number

  /** Maximum candidates to return (default: 3) */
  maxCandidates?: number
}

/**
 * Computes a replay candidate score for a trace.
 * Higher score = more worthy of replay.
 */
const computeReplayCandidateScore = (
  trace: EpisodicTrace,
  input: DeriveReplayCandidatesInput,
): { score: number; reasons: string[] } => {
  let score = 0.0
  const reasons: string[] = []

  // Base salience
  score += trace.salience * 0.3
  if (trace.salience > 0.6) {
    reasons.push('high-salience')
  }

  // Unresolved tensions increase replay worthiness
  const unresolvedCount = trace.unresolvedTensionKeys.length
  if (unresolvedCount > 0) {
    score += unresolvedCount * 0.15
    reasons.push(`unresolved-tensions:${unresolvedCount}`)
  }

  // Prefer traces that haven't been replayed many times
  if (trace.replayCount === 0) {
    score += 0.25
    reasons.push('not-yet-replayed')
  } else if (trace.replayCount < 2) {
    score += 0.1
    reasons.push('replayed-once')
  } else {
    // Already replayed multiple times - less priority
    score -= 0.15
  }

  // Already consolidated traces have lower priority
  if (trace.consolidated) {
    score -= 0.2
  }

  // Resonance with current afterglow
  if (input.afterglow > 0.1) {
    // Recent traces resonate more with current afterglow
    const age = input.currentTurn - trace.createdAtTurn
    if (age < 5) {
      score += 0.15
      reasons.push('resonates-with-afterglow')
    }
  }

  // Resonance with workspace held items
  if (input.workspace.heldItems.length > 0) {
    // Check if trace textures match workspace item content (simple heuristic)
    const workspaceContents = input.workspace.heldItems.map((item) => item.content.toLowerCase())
    const matchesWorkspace = trace.dominantTextureTags.some((tag) =>
      workspaceContents.some((content) => content.includes(tag) || tag.includes(content.split(' ')[0]))
    )
    if (matchesWorkspace) {
      score += 0.2
      reasons.push('workspace-resonance')
    }
  }

  // Recent high field intensity makes old traces less relevant
  if (input.recentFieldIntensity > 0.7) {
    const age = input.currentTurn - trace.createdAtTurn
    if (age > 10) {
      score -= 0.1
    }
  }

  return { score: Math.max(score, 0.0), reasons }
}

/**
 * Derives replay candidates from the episodic buffer.
 * Returns top-scored traces up to maxCandidates.
 */
export const deriveReplayCandidates = (
  input: DeriveReplayCandidatesInput,
): ReplayCandidate[] => {
  const { episodicBuffer, maxCandidates = 3 } = input

  // Score all traces
  const scored = episodicBuffer.map((trace) => {
    const { score, reasons } = computeReplayCandidateScore(trace, input)
    return {
      traceId: trace.id,
      score,
      reasons,
    }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Return top candidates
  return scored.slice(0, maxCandidates)
}

/**
 * Determines whether replay should run this turn.
 * Replay runs when:
 * - Every 3 turns
 * - Or when episodic buffer is large
 * - Or when afterglow is high
 * - Or when unresolved tension is high
 */
export const shouldRunReplay = (
  episodicBuffer: EpisodicTrace[],
  currentTurn: number,
  afterglow: number,
  lastReplayTurn: number,
): boolean => {
  // Don't replay too frequently
  const turnsSinceLastReplay = currentTurn - lastReplayTurn
  if (turnsSinceLastReplay < 2) {
    return false
  }

  // Periodic replay every 3 turns
  if (currentTurn % 3 === 0) {
    return true
  }

  // Buffer getting large?
  if (episodicBuffer.length > 10) {
    return true
  }

  // High afterglow suggests active processing
  if (afterglow > 0.12) {
    return true
  }

  // High unresolved tension count
  const unresolvedCount = episodicBuffer.reduce(
    (sum, trace) => sum + trace.unresolvedTensionKeys.length,
    0,
  )
  if (unresolvedCount > 3) {
    return true
  }

  return false
}
