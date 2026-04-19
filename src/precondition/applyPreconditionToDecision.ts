import type { PreconditionFilter } from './types'
import type { SignalDecision } from '../signal/types'

/**
 * Applies precondition filter to signal decision.
 * Preconditions can influence whether to speak, utterance mode, and closeness.
 */
export const applyPreconditionToDecision = (
  decision: SignalDecision,
  precondition: PreconditionFilter,
): SignalDecision => {
  const { existence, belief } = precondition

  // Existence layer: selfPresence affects closeness/distance
  const existenceClosenessBoost = existence.selfPresence * 0.1
  const modulatedCloseness = Math.min(
    1,
    (decision.closeness ?? 0.5) + existenceClosenessBoost,
  )

  // Belief layer: if doNotForceTooEarly is high, increase withheldBias slightly
  const beliefWithheldModulation = belief.doNotForceTooEarly > 0.8 ? 1.1 : 1.0
  const modulatedWithheldBias = Math.min(
    1,
    (decision.withheldBias ?? 0.5) * beliefWithheldModulation,
  )

  return {
    ...decision,
    closeness: modulatedCloseness,
    withheldBias: modulatedWithheldBias,
    decisionTrace: [
      ...decision.decisionTrace,
      `precondition: existence=${existence.selfPresence.toFixed(2)} belief=${belief.preserveAliveness.toFixed(2)}`,
    ],
  }
}
