import type { SignalBoundaryLoopState, SignalBoundarySource } from './signalLoopTypes'

export type SignalSourceInput = {
  source: SignalBoundarySource
  strength: number
}

/**
 * Update Boundary-Loop state based on signal source classifications.
 *
 * The boundary loop:
 * - Tracks the balance between external and internal signals
 * - Computes boundary tension (conflict between sources)
 * - Records recent source strengths
 * - Helps the system know "where signals are coming from"
 *
 * This enables distinguishing:
 * - External stimuli (user input, sensory data)
 * - Internal replay (self-generated patterns)
 * - Teacher signals (binding teacher guidance)
 * - Future: Mother hints, AETERNA baselines
 */
export function updateBoundaryLoop(
  currentState: SignalBoundaryLoopState,
  signalSources: SignalSourceInput[],
  predictionResidue: number,
): SignalBoundaryLoopState {
  const now = Date.now()

  // Compute total strength and source balance
  const totalStrength = signalSources.reduce((sum, s) => sum + s.strength, 0)

  const newSourceBalance: Record<SignalBoundarySource, number> = {
    external: 0,
    internal: 0,
    teacher: 0,
    future_mother: 0,
    future_aeterna: 0,
  }

  if (totalStrength > 0) {
    for (const source of signalSources) {
      newSourceBalance[source.source] += source.strength / totalStrength
    }
  } else {
    // No new signals; decay toward balanced state
    newSourceBalance.external = currentState.sourceBalance.external * 0.95
    newSourceBalance.internal = currentState.sourceBalance.internal * 0.95
    newSourceBalance.teacher = currentState.sourceBalance.teacher * 0.95
    newSourceBalance.future_mother = currentState.sourceBalance.future_mother * 0.95
    newSourceBalance.future_aeterna = currentState.sourceBalance.future_aeterna * 0.95
  }

  // Compute boundary tension: how much conflict between internal and external?
  const externalRatio = newSourceBalance.external
  const internalRatio = newSourceBalance.internal + newSourceBalance.teacher
  const tensionFromConflict = Math.abs(externalRatio - internalRatio)
  const newBoundaryTension = Math.min(1.0, tensionFromConflict + predictionResidue * 0.3)

  // Track recent source strengths
  const externalStrength = signalSources
    .filter(s => s.source === 'external')
    .reduce((sum, s) => sum + s.strength, 0)

  const internalStrength = signalSources
    .filter(s => s.source === 'internal')
    .reduce((sum, s) => sum + s.strength, 0)

  const teacherStrength = signalSources
    .filter(s => s.source === 'teacher')
    .reduce((sum, s) => sum + s.strength, 0)

  return {
    sourceBalance: newSourceBalance,
    boundaryTension: newBoundaryTension,
    recentExternalStrength: externalStrength,
    recentInternalStrength: internalStrength,
    recentTeacherStrength: teacherStrength,
    predictionResidue,
    lastUpdatedAt: now,
  }
}
