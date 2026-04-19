import type { PreconditionFilter } from './types'
import type { UtteranceIntent } from '../utterance/types'

/**
 * Applies precondition filter to utterance intent.
 * Preconditions subtly shape emotional distance and withhold tendency.
 */
export const applyPreconditionToUtterance = (
  utteranceIntent: UtteranceIntent,
  precondition: PreconditionFilter,
): UtteranceIntent => {
  const { home, existence, belief } = precondition

  // Home: if allowOneLivingThread is high, reduce scatter
  const homeCoherence = home.allowOneLivingThread

  // Existence: selfPresence affects emotional distance
  // Higher selfPresence can mean more grounded, slightly closer emotional distance
  const existenceDistanceModulation = (1 - existence.selfPresence) * 0.1
  const modulatedDistance = Math.max(
    0,
    Math.min(1, utteranceIntent.emotionalDistance + existenceDistanceModulation),
  )

  // Belief: honorFragility increases withhold tendency to protect delicate states
  const beliefWithholdBoost = belief.honorFragility * 0.1
  const modulatedWithhold = Math.min(
    1,
    utteranceIntent.withholdTendency + beliefWithholdBoost,
  )

  return {
    ...utteranceIntent,
    emotionalDistance: modulatedDistance,
    withholdTendency: modulatedWithhold,
    // Add subtle trace if significant modulation occurred
    trace: [
      ...(utteranceIntent.trace || []),
      ...(homeCoherence > 0.7 ? ['precondition:home_coherent'] : []),
      ...(existence.selfPresence > 0.6 ? ['precondition:self_present'] : []),
      ...(belief.honorFragility > 0.7 ? ['precondition:honor_fragile'] : []),
    ],
  }
}
