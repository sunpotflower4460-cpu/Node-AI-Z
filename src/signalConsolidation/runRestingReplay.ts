import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { RestingReplayResult } from './signalConsolidationTypes'

/**
 * Run resting-state replay on recent assemblies.
 *
 * During rest, the system replays recent patterns to:
 * - Strengthen stable, recurring patterns
 * - Weaken inconsistent patterns
 * - Reduce teacher dependency for successfully recalled patterns
 */
export function runRestingReplay(branch: SignalPersonalBranch): RestingReplayResult {
  const replayedAssemblyIds: string[] = []
  const strengthenedAssemblyIds: string[] = []
  const weakenedAssemblyIds: string[] = []
  const notes: string[] = []

  // Select recent assemblies for replay (prioritize high stability and recurrence)
  const replayCandidates = branch.assemblyRecords
    .filter(record => record.recurrenceCount > 1)
    .sort((a, b) => {
      const scoreA = a.stabilityScore * 0.6 + a.recurrenceCount * 0.4
      const scoreB = b.stabilityScore * 0.6 + b.recurrenceCount * 0.4
      return scoreB - scoreA
    })
    .slice(0, Math.min(5, branch.assemblyRecords.length))

  for (const candidate of replayCandidates) {
    replayedAssemblyIds.push(candidate.assemblyId)

    // Replay success criteria: high stability + multiple recurrences
    const replaySuccess =
      candidate.stabilityScore > 0.6 && candidate.recurrenceCount >= 3

    if (replaySuccess) {
      strengthenedAssemblyIds.push(candidate.assemblyId)
      notes.push(
        `Assembly ${candidate.assemblyId.slice(0, 8)} strengthened (stability: ${candidate.stabilityScore.toFixed(2)}, recurrence: ${candidate.recurrenceCount})`,
      )
    } else if (candidate.stabilityScore < 0.3 && candidate.recurrenceCount < 2) {
      // Weaken very unstable patterns that don't recur
      weakenedAssemblyIds.push(candidate.assemblyId)
      notes.push(
        `Assembly ${candidate.assemblyId.slice(0, 8)} weakened (low stability/recurrence)`,
      )
    }
  }

  const replaySuccessRate =
    replayedAssemblyIds.length > 0
      ? strengthenedAssemblyIds.length / replayedAssemblyIds.length
      : 0

  return {
    replayedAssemblyIds,
    strengthenedAssemblyIds,
    weakenedAssemblyIds,
    replaySuccessRate,
    notes,
  }
}
