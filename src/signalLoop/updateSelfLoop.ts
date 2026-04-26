import type { SignalSelfLoopState } from './signalLoopTypes'
import type { SignalFieldState, ActivationEvent } from '../signalField/signalFieldTypes'

/**
 * Update Self-Loop state based on current Signal Field activity.
 *
 * The self-loop:
 * - Tracks recently active assemblies and particles
 * - Builds up self-echo strength (resonance from previous turns)
 * - Adjusts baseline activation (carry-over from prior activity)
 * - Modulates replay tendency
 *
 * This prevents complete reset each turn; recent history influences current state.
 */
export function updateSelfLoop(
  currentState: SignalSelfLoopState,
  signalField: SignalFieldState,
  recentEvents: ActivationEvent[],
): SignalSelfLoopState {
  const now = Date.now()

  // Extract currently active assemblies
  const currentAssemblyIds = signalField.assemblies
    .filter(a => now - a.lastActivatedAt < 500)
    .map(a => a.id)

  // Extract currently active particles
  const currentParticleIds = signalField.particles
    .filter(p => p.activation > 0.2)
    .map(p => p.id)
    .slice(0, 20) // Keep top 20

  // Merge with recent history (keep last 10 assemblies, last 30 particles)
  const mergedAssemblies = [
    ...new Set([...currentAssemblyIds, ...currentState.recentAssemblyIds]),
  ].slice(0, 10)

  const mergedParticles = [
    ...new Set([...currentParticleIds, ...currentState.recentActiveParticleIds]),
  ].slice(0, 30)

  // Compute self-echo strength: how much overlap between previous and current?
  const assemblyOverlap = currentAssemblyIds.filter(id =>
    currentState.recentAssemblyIds.includes(id),
  ).length
  const particleOverlap = currentParticleIds.filter(id =>
    currentState.recentActiveParticleIds.includes(id),
  ).length

  const newSelfEchoStrength =
    (assemblyOverlap / Math.max(1, currentAssemblyIds.length) +
      particleOverlap / Math.max(1, currentParticleIds.length)) /
    2

  // Baseline activation: average of current high activations
  const highActivations = signalField.particles
    .filter(p => p.activation > 0.3)
    .map(p => p.activation)

  const newBaselineActivation =
    highActivations.length > 0
      ? highActivations.reduce((sum, a) => sum + a, 0) / highActivations.length
      : currentState.baselineActivation * 0.9 // Decay if no high activations

  // Replay tendency: increase if replay events occurred
  const replayEvents = recentEvents.filter(e => e.source === 'replay')
  const replayBoost = replayEvents.length > 0 ? 0.05 : 0
  const newReplayTendency = Math.min(
    1.0,
    Math.max(0.0, currentState.replayTendency * 0.95 + replayBoost),
  )

  // Internal rhythm: oscillates based on activity patterns
  const activityStrength = highActivations.length / Math.max(1, signalField.particles.length)
  const newInternalRhythm = Math.min(1.0, currentState.internalRhythm * 0.9 + activityStrength * 0.1)

  return {
    recentAssemblyIds: mergedAssemblies,
    recentActiveParticleIds: mergedParticles,
    selfEchoStrength: newSelfEchoStrength,
    replayTendency: newReplayTendency,
    baselineActivation: newBaselineActivation,
    internalRhythm: newInternalRhythm,
    lastUpdatedAt: now,
  }
}
