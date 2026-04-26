import type { SignalFieldState } from '../signalField/signalFieldTypes'

/**
 * Identify weak links that are candidates for pruning.
 *
 * Returns a list of link indices that could be removed.
 * Does not actually remove them - just identifies candidates.
 */
export function pruneWeakSignalLinks(
  fieldState: SignalFieldState,
  pruneThreshold: number = 0.1,
  ageThreshold: number = 100,
): {
  pruneCandidateCount: number
  candidateIndices: number[]
  notes: string[]
} {
  const candidateIndices: number[] = []
  const notes: string[] = []

  fieldState.links.forEach((link, index) => {
    // Candidate for pruning if:
    // - Weight is below threshold AND age is high (unused, weak link)
    // - Not a cross-modal bridge (those are handled separately)
    if (
      link.weight < pruneThreshold &&
      link.age > ageThreshold &&
      !link.isCrossModal
    ) {
      candidateIndices.push(index)
    }
  })

  if (candidateIndices.length > 0) {
    notes.push(
      `Identified ${candidateIndices.length} weak links as prune candidates (threshold: ${pruneThreshold}, age: ${ageThreshold})`,
    )
  }

  return {
    pruneCandidateCount: candidateIndices.length,
    candidateIndices,
    notes,
  }
}
