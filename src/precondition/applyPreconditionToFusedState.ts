import type { FusedState } from '../fusion/types'
import type { PreconditionFilter } from './types'

/**
 * Applies precondition filter to fused state.
 * The precondition acts as a gentle modulation, not a hard override.
 */
export const applyPreconditionToFusedState = (
  fusedState: FusedState,
  precondition: PreconditionFilter,
): FusedState => {
  const { home, existence, belief } = precondition

  // Apply subtle modulation to fused confidence based on preconditions
  // Higher returnBeforeOutput and selfPresence increase stability
  const stabilityBoost = (home.returnBeforeOutput + existence.hereNowStability) / 2
  const modulatedConfidence = fusedState.fusedConfidence * (0.7 + stabilityBoost * 0.3)

  // Filter dominant textures based on belief system
  // Beliefs can suppress certain textures or amplify others
  const filteredTextures = fusedState.dominantTextures.filter((texture) => {
    // If belief honors fragility, keep 'fragile' textures
    if (texture.includes('fragile') && belief.honorFragility > 0.7) {
      return true
    }
    // If belief protects living thread, keep 'searching' or 'open' textures
    if (
      (texture.includes('searching') || texture.includes('open')) &&
      belief.protectLivingThread > 0.7
    ) {
      return true
    }
    // Default: keep most textures
    return true
  })

  return {
    ...fusedState,
    fusedConfidence: modulatedConfidence,
    dominantTextures: filteredTextures,
    integratedTensions: [
      ...fusedState.integratedTensions,
      // Add precondition-based tensions as subtle markers
      ...(home.returnBeforeOutput > 0.6 ? ['precondition:home_centered'] : []),
      ...(existence.selfPresence > 0.6 ? ['precondition:self_present'] : []),
      ...(belief.preserveAliveness > 0.8 ? ['precondition:preserve_alive'] : []),
    ],
  }
}
