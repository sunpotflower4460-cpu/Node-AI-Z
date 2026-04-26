import type { SignalFieldState, ParticlePoint } from '../signalField/signalFieldTypes'

/**
 * Apply lateral inhibition to prevent runaway activation.
 *
 * Reduces activation of highly active particles to prevent
 * the entire field from saturating.
 *
 * Returns a map of particle ID to inhibition factor (0-1).
 */
export function applyLateralInhibition(
  fieldState: SignalFieldState,
  inhibitionStrength: number = 0.3,
): Map<string, number> {
  const inhibitionMap = new Map<string, number>()

  // Find average activation
  const activeParticles = fieldState.particles.filter(p => p.activation > 0.1)
  if (activeParticles.length === 0) {
    return inhibitionMap
  }

  const avgActivation =
    activeParticles.reduce((sum, p) => sum + p.activation, 0) / activeParticles.length

  // Apply inhibition to particles above average
  for (const particle of fieldState.particles) {
    if (particle.activation > avgActivation * 1.5) {
      // Strong particles get inhibited more
      const excessActivation = (particle.activation - avgActivation) / avgActivation
      const inhibitionFactor = Math.min(0.5, inhibitionStrength * excessActivation)
      inhibitionMap.set(particle.id, 1.0 - inhibitionFactor)
    }
  }

  return inhibitionMap
}
