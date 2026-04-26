import type { SignalCompetitionResult } from './signalInhibitionTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

/**
 * Compute competition among active assemblies.
 *
 * Implements winner-take-more (not winner-take-all) dynamics.
 * Divides active assemblies into:
 * - Dominant: strongest patterns (up to 2-3)
 * - Coactive: medium strength patterns (background, not suppressed)
 * - Suppressed: weak or competing patterns (temporarily inhibited)
 */
export function computeSignalCompetition(
  branch: SignalPersonalBranch,
  recentlyActiveAssemblyIds: string[],
): SignalCompetitionResult {
  const notes: string[] = []

  if (recentlyActiveAssemblyIds.length === 0) {
    return {
      dominantAssemblyIds: [],
      coactiveAssemblyIds: [],
      suppressedAssemblyIds: [],
      inhibitionStrength: 0,
      notes: ['No active assemblies'],
    }
  }

  // Score each assembly by stability * recurrence
  const scoredAssemblies = recentlyActiveAssemblyIds
    .map(id => {
      const record = branch.assemblyRecords.find(r => r.assemblyId === id)
      if (!record) return { id, score: 0 }
      return {
        id,
        score: record.stabilityScore * 0.6 + record.recurrenceCount * 0.04,
      }
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)

  // Determine dominant assemblies (top 1-3)
  const dominantCount = Math.min(3, Math.max(1, Math.floor(scoredAssemblies.length * 0.3)))
  const dominantAssemblyIds = scoredAssemblies.slice(0, dominantCount).map(a => a.id)

  // Determine coactive assemblies (middle tier)
  const coactiveCount = Math.floor(scoredAssemblies.length * 0.4)
  const coactiveAssemblyIds = scoredAssemblies
    .slice(dominantCount, dominantCount + coactiveCount)
    .map(a => a.id)

  // Suppressed assemblies (bottom tier)
  const suppressedAssemblyIds = scoredAssemblies
    .slice(dominantCount + coactiveCount)
    .map(a => a.id)

  const inhibitionStrength =
    suppressedAssemblyIds.length > 0
      ? suppressedAssemblyIds.length / scoredAssemblies.length
      : 0

  notes.push(
    `Competition: ${dominantCount} dominant, ${coactiveCount} coactive, ${suppressedAssemblyIds.length} suppressed`,
  )

  return {
    dominantAssemblyIds,
    coactiveAssemblyIds,
    suppressedAssemblyIds,
    inhibitionStrength,
    notes,
  }
}
