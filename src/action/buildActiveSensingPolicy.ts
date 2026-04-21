/**
 * Build Active Sensing Policy
 *
 * Phase 3: Constructs internal action policy from multiple sources.
 * This is NOT template selection. It determines WHAT to do internally before utterance.
 */

import type { CoalitionActionSelection } from '../coalition/selectCoalitionAction'
import type { ConfidenceState } from '../meta/computeInterpretationConfidence'
import type { UncertaintyState } from '../predictive/uncertaintyTypes'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { InteroceptiveState } from '../interoception/interoceptiveState'

export type InternalAction = 'answer' | 'hold' | 'ask' | 'explore' | 'bridge'

export type InternalActionPolicy = {
  preferredAction: InternalAction
  confidence: number
  reasons: string[]
}

export type BuildActiveSensingPolicyInput = {
  coalitionAction: CoalitionActionSelection
  confidenceState?: ConfidenceState
  uncertaintyState?: UncertaintyState
  workspaceState: WorkspaceState
  interoceptiveState: InteroceptiveState
}

/**
 * Build active sensing policy from internal state.
 *
 * Key principle: This is NOT heuristics over confidence/uncertainty.
 * It reads from coalition action, workspace phase, and interoceptive state
 * to determine the internal stance BEFORE utterance generation.
 *
 * Active sensing: Not just answering, but asking, exploring, bridging, holding.
 */
export const buildActiveSensingPolicy = ({
  coalitionAction,
  confidenceState,
  uncertaintyState,
  workspaceState,
  interoceptiveState,
}: BuildActiveSensingPolicyInput): InternalActionPolicy => {
  const reasons: string[] = []

  // Start with coalition action as base
  let preferredAction = coalitionAction.preferredAction
  let confidence = coalitionAction.confidence
  reasons.push(`Coalition suggests: ${coalitionAction.preferredAction}`)

  // Override 1: High overload or low energy -> hold
  if (interoceptiveState.overload > 0.7 || interoceptiveState.energy < 0.3) {
    preferredAction = 'hold'
    confidence = Math.max(0.6, confidence)
    reasons.push(`High overload (${interoceptiveState.overload.toFixed(2)}) or low energy (${interoceptiveState.energy.toFixed(2)}) -> hold`)
  }

  // Override 2: Block phase -> hold or ask (not answer)
  if (workspaceState.phase === 'block' && preferredAction === 'answer') {
    preferredAction = interoceptiveState.noveltyHunger > 0.6 ? 'ask' : 'hold'
    confidence *= 0.8
    reasons.push(`Workspace block phase -> ${preferredAction}`)
  }

  // Override 3: High uncertainty + low decision confidence -> ask or explore
  if (uncertaintyState && confidenceState) {
    const highUncertainty = (uncertaintyState.sensoryUncertainty + uncertaintyState.modelUncertainty) / 2 > 0.6
    const lowDecisionConfidence = confidenceState.shouldHold || confidenceState.decisionStrength < 0.45

    if (highUncertainty && lowDecisionConfidence && preferredAction === 'answer') {
      preferredAction = interoceptiveState.noveltyHunger > 0.5 ? 'explore' : 'ask'
      confidence *= 0.7
      reasons.push(`High uncertainty + low decision confidence -> ${preferredAction}`)
    }
  }

  // Override 4: Low social safety -> gentle hold or ask (not aggressive answer)
  if (interoceptiveState.socialSafety < 0.4 && preferredAction === 'answer') {
    preferredAction = interoceptiveState.uncertaintyTolerance > 0.6 ? 'bridge' : 'hold'
    confidence *= 0.75
    reasons.push(`Low social safety (${interoceptiveState.socialSafety.toFixed(2)}) -> ${preferredAction}`)
  }

  // Boost 1: High novelty hunger favors explore over hold
  if (interoceptiveState.noveltyHunger > 0.7 && preferredAction === 'hold') {
    preferredAction = 'explore'
    confidence = Math.max(0.5, confidence)
    reasons.push(`High novelty hunger (${interoceptiveState.noveltyHunger.toFixed(2)}) -> explore`)
  }

  // Boost 2: Should explore flag from confidence
  if (confidenceState?.shouldAsk && preferredAction !== 'explore' && preferredAction !== 'ask') {
    preferredAction = 'explore'
    confidence = Math.max(0.5, confidence * 1.1)
    reasons.push('Confidence meta-layer suggests explore')
  }

  // Boost 3: Encode phase + stable coalition -> answer is viable
  if (workspaceState.phase === 'encode' && workspaceState.stability > 0.7 && coalitionAction.preferredAction === 'answer') {
    preferredAction = 'answer'
    confidence = Math.min(0.9, confidence * 1.1)
    reasons.push('Encode phase + stable coalition -> answer viable')
  }

  // Clamp confidence
  confidence = Math.max(0.1, Math.min(1.0, confidence))

  return {
    preferredAction,
    confidence,
    reasons,
  }
}
