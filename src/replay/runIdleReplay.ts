/**
 * Run Idle Replay
 *
 * Processes replay candidates to update schema and personal learning.
 * This is NOT re-displaying history - it's offline consolidation.
 *
 * Replay should:
 * - Lightly update schema weights
 * - Reinforce or weaken pathway strengths
 * - NOT do full reprocessing (too expensive)
 * - Select only top candidates
 */

import type { ReplayQueue } from './buildReplayQueue'
import type { PersonalLearningState } from '../learning/types'

export type ReplayUpdate = {
  /** Pathway ID that was updated */
  pathwayId: string
  /** Previous strength */
  previousStrength: number
  /** New strength */
  newStrength: number
  /** Adjustment amount */
  adjustment: number
}

export type ReplaySummary = {
  /** Number of episodes replayed */
  episodesReplayed: number
  /** Pathway updates made */
  pathwayUpdates: ReplayUpdate[]
  /** Total consolidation strength (0-1) */
  consolidationStrength: number
  /** Debug notes */
  debugNotes: string[]
}

/**
 * Run idle replay on queue candidates
 *
 * This is a lightweight consolidation process:
 * - Takes top replay candidates
 * - Makes small adjustments to pathway strengths
 * - Simulates memory consolidation
 */
export const runIdleReplay = (
  replayQueue: ReplayQueue,
  personalLearning: PersonalLearningState,
  consolidationRate = 0.05, // Small updates only
): { updatedLearning: PersonalLearningState; summary: ReplaySummary } => {
  const debugNotes: string[] = []
  const pathwayUpdates: ReplayUpdate[] = []

  if (replayQueue.count === 0) {
    debugNotes.push('No replay candidates - skipping idle replay')
    return {
      updatedLearning: personalLearning,
      summary: {
        episodesReplayed: 0,
        pathwayUpdates: [],
        consolidationStrength: 0,
        debugNotes,
      },
    }
  }

  debugNotes.push(`Starting idle replay: ${replayQueue.count} candidates`)

  // Clone pathway strengths for updating
  const updatedPathways = { ...personalLearning.pathwayStrengths }

  // Process each candidate
  let totalConsolidation = 0
  for (const candidate of replayQueue.candidates) {
    const { priority } = candidate

    // Replay strengthens recent pathways slightly
    // Use a small subset of pathways (simulate selective consolidation)
    const pathwayIds = Object.keys(updatedPathways)
    const sampleSize = Math.min(5, pathwayIds.length)
    const sampledPathways = pathwayIds
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize)

    for (const pathwayId of sampledPathways) {
      const previousStrength = updatedPathways[pathwayId] ?? 0
      // Small reinforcement weighted by replay priority
      const adjustment = consolidationRate * priority * (Math.random() * 0.5 + 0.5)
      const newStrength = Math.min(1.0, previousStrength + adjustment)

      if (adjustment > 0.001) {
        updatedPathways[pathwayId] = newStrength
        pathwayUpdates.push({
          pathwayId,
          previousStrength,
          newStrength,
          adjustment,
        })
      }
    }

    totalConsolidation += priority
  }

  const avgConsolidation = totalConsolidation / replayQueue.count

  debugNotes.push(
    `Idle replay completed: ${replayQueue.count} episodes, ${pathwayUpdates.length} pathway updates`
  )
  debugNotes.push(`Average consolidation strength: ${avgConsolidation.toFixed(3)}`)

  return {
    updatedLearning: {
      ...personalLearning,
      pathwayStrengths: updatedPathways,
    },
    summary: {
      episodesReplayed: replayQueue.count,
      pathwayUpdates,
      consolidationStrength: avgConsolidation,
      debugNotes,
    },
  }
}
