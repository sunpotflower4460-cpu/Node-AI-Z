import type { UtteranceIntent } from './types'
import type { FusedState } from '../fusion/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness, OptionDecisionShape } from '../option/types'
import type { SomaticInfluence } from '../somatic/types'

export type DeriveUtteranceIntentInput = {
  fusedState: FusedState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  somaticInfluence?: SomaticInfluence
  currentDecision?: OptionDecisionShape
}

/**
 * Derive UtteranceIntent from internal state
 *
 * Decides WHAT to do communicatively based on the internal crystallized state.
 * This is the bridge between internal processing and external expression.
 */
export const deriveUtteranceIntent = ({
  fusedState,
  narrativeProtoMeanings,
  optionAwareness,
  somaticInfluence,
  currentDecision,
}: DeriveUtteranceIntentInput): UtteranceIntent => {
  // Extract texture signals from fusedState
  const textures = fusedState.dominantTextures || []
  const hasHeaviness = textures.some((t) => t.includes('heavy') || t.includes('weight'))
  const hasFragility = textures.some((t) => t.includes('fragile') || t.includes('delicate'))
  const hasConfusion = textures.some((t) => t.includes('confused') || t.includes('unclear'))
  const hasOpenness = textures.some((t) => t.includes('open') || t.includes('expansive'))

  // Extract narrative clarity
  const narrativeClarity = narrativeProtoMeanings.reduce((sum, pm) => sum + pm.strength, 0)
  const hasStrongNarrative = narrativeClarity > 0.6

  // Option awareness analysis
  const hasOptions = !!optionAwareness && optionAwareness.confidence > 0.4
  const hasAmbivalence = optionAwareness && optionAwareness.hesitationStrength > 0.5
  const gapIsSmall = optionAwareness && optionAwareness.differenceMagnitude < 0.3
  const bridgePossible = optionAwareness?.bridgeOptionPossible ?? false

  // Somatic influence
  const shouldAnswer = somaticInfluence?.averageOutcome?.helpfulness
    ? somaticInfluence.averageOutcome.helpfulness > 0.3
    : false
  const shouldStayOpen = somaticInfluence?.averageOutcome?.openness
    ? somaticInfluence.averageOutcome.openness > 0.5
    : false

  // Decision analysis
  const stanceCommits = currentDecision?.stance === 'commit'
  const stanceBridges = currentDecision?.stance === 'bridge'
  const shouldDefer = currentDecision?.shouldDefer ?? false

  // Determine primary move
  let primaryMove: UtteranceIntent['primaryMove'] = 'reflect'

  if (hasOptions && stanceBridges && bridgePossible) {
    primaryMove = 'bridge_suggest'
  } else if (hasOptions && hasAmbivalence) {
    primaryMove = 'option_compare'
  } else if (shouldDefer || (hasFragility && !shouldAnswer)) {
    primaryMove = 'hold'
  } else if (shouldAnswer && hasStrongNarrative && !shouldDefer) {
    primaryMove = hasOpenness ? 'soft_answer' : 'structured_answer'
  } else if (hasConfusion || (hasAmbivalence && gapIsSmall)) {
    primaryMove = 'gentle_probe'
  } else if (hasHeaviness || hasFragility) {
    primaryMove = 'reflect'
  } else if (shouldAnswer) {
    primaryMove = 'soft_answer'
  }

  // Derive dimensions
  const emotionalDistance = hasFragility ? 0.3 : hasHeaviness ? 0.4 : 0.5
  const answerForce = stanceCommits ? 0.8 : shouldAnswer ? 0.6 : 0.3
  const structureNeed = primaryMove === 'structured_answer' ? 0.8 : hasOptions ? 0.6 : 0.4
  const warmth = hasFragility ? 0.7 : hasOpenness ? 0.6 : 0.5
  const ambiguityTolerance = shouldStayOpen ? 0.7 : hasAmbivalence ? 0.6 : 0.4

  return {
    primaryMove,
    emotionalDistance,
    answerForce,
    structureNeed,
    warmth,
    ambiguityTolerance,
  }
}
