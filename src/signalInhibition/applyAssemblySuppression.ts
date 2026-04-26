import type { SignalCompetitionResult } from './signalInhibitionTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

/**
 * Apply suppression to competing assemblies.
 *
 * Prevents multiple similar assemblies from all being promoted simultaneously.
 * Assemblies that share many particles compete with each other.
 *
 * Returns updated competition result with additional suppression applied.
 */
export function applyAssemblySuppression(
  competition: SignalCompetitionResult,
  branch: SignalPersonalBranch,
): SignalCompetitionResult {
  const notes = [...competition.notes]
  const additionalSuppressed: string[] = []

  // Check for assemblies that share too many particles
  const dominantAssemblies = competition.dominantAssemblyIds
    .map(id => branch.assemblyRecords.find(r => r.assemblyId === id))
    .filter(Boolean)

  const coactiveAssemblies = competition.coactiveAssemblyIds
    .map(id => branch.assemblyRecords.find(r => r.assemblyId === id))
    .filter(Boolean)

  // Check coactive assemblies for overlap with dominant ones
  for (const coactive of coactiveAssemblies) {
    if (!coactive) continue

    for (const dominant of dominantAssemblies) {
      if (!dominant) continue

      // Count shared particles
      const sharedCount = coactive.particleIds.filter(pid =>
        dominant.particleIds.includes(pid),
      ).length

      const overlapRatio = sharedCount / Math.min(coactive.particleIds.length, dominant.particleIds.length)

      // If high overlap and coactive is less stable, suppress it
      if (overlapRatio > 0.6 && coactive.stabilityScore < dominant.stabilityScore) {
        additionalSuppressed.push(coactive.assemblyId)
        notes.push(
          `Suppressed ${coactive.assemblyId.slice(0, 8)} due to overlap with dominant ${dominant.assemblyId.slice(0, 8)}`,
        )
        break
      }
    }
  }

  // Remove additionally suppressed from coactive, add to suppressed
  const updatedCoactive = competition.coactiveAssemblyIds.filter(
    id => !additionalSuppressed.includes(id),
  )
  const updatedSuppressed = [
    ...competition.suppressedAssemblyIds,
    ...additionalSuppressed,
  ]

  return {
    ...competition,
    coactiveAssemblyIds: updatedCoactive,
    suppressedAssemblyIds: updatedSuppressed,
    notes,
  }
}
