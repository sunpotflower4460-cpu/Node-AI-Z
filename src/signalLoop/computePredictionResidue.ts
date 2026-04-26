import type { SignalFieldState } from '../signalField/signalFieldTypes'

/**
 * Compute prediction residue: the difference between expected and actual activation.
 *
 * High residue indicates:
 * - Surprise (actual activation much higher than predicted)
 * - Novelty (new patterns emerged)
 * - Boundary crossing (external input disrupted internal expectations)
 *
 * Low residue indicates:
 * - Expected patterns (self-loop resonance)
 * - Predictable dynamics (internal rhythm)
 *
 * For now, this is a simple heuristic based on:
 * - Recent assembly stability (expected = stable assemblies)
 * - Actual activation strength (actual = current particle activations)
 *
 * Future: Could use predictive coding / free energy framework.
 */
export function computePredictionResidue(
  previousField: SignalFieldState | undefined,
  currentField: SignalFieldState,
): number {
  if (!previousField) {
    // First turn: high residue (everything is new)
    return 0.5
  }

  // Expected: based on stable assemblies from previous turn
  const stableAssemblyIds = new Set(
    previousField.assemblies.filter(a => a.recurrenceCount >= 3).map(a => a.id),
  )

  const currentAssemblyIds = new Set(currentField.assemblies.map(a => a.id))

  // How many current assemblies were expected?
  const expectedCount = [...currentAssemblyIds].filter(id => stableAssemblyIds.has(id)).length
  const unexpectedCount = currentAssemblyIds.size - expectedCount

  // Expected activation: average of previous high activations
  const prevHighActivations = previousField.particles
    .filter(p => p.activation > 0.3)
    .map(p => p.activation)
  const expectedActivation =
    prevHighActivations.length > 0
      ? prevHighActivations.reduce((sum, a) => sum + a, 0) / prevHighActivations.length
      : 0.3

  // Actual activation: average of current high activations
  const currentHighActivations = currentField.particles
    .filter(p => p.activation > 0.3)
    .map(p => p.activation)
  const actualActivation =
    currentHighActivations.length > 0
      ? currentHighActivations.reduce((sum, a) => sum + a, 0) / currentHighActivations.length
      : 0.0

  // Residue from assembly surprise
  const assemblyResidue =
    currentAssemblyIds.size > 0 ? unexpectedCount / currentAssemblyIds.size : 0

  // Residue from activation mismatch
  const activationResidue = Math.abs(actualActivation - expectedActivation)

  // Combined residue (weighted average)
  const totalResidue = assemblyResidue * 0.6 + activationResidue * 0.4

  return Math.min(1.0, totalResidue)
}
