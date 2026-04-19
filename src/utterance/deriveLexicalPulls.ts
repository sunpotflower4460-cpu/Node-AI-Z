import type { LexicalPulls } from './types'
import type { FusedState } from '../fusion/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'

export type DeriveLexicalPullsInput = {
  fusedState: FusedState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
}

/**
 * Derive LexicalPulls from internal state
 *
 * Specifies which vocabulary to draw toward and which patterns to avoid.
 */
export const deriveLexicalPulls = ({
  fusedState,
  sensoryProtoMeanings,
  narrativeProtoMeanings,
  optionAwareness,
}: DeriveLexicalPullsInput): LexicalPulls => {
  // Extract textures from fusedState
  const preferredTextures = fusedState.dominantTextures.slice(0, 3)

  // Extract meaning phrases from narrative proto meanings
  const preferredMeaningPhrases = narrativeProtoMeanings
    .filter((pm) => pm.strength > 0.4)
    .slice(0, 3)
    .map((pm) => pm.glossJa)

  // Extract option phrases
  const preferredOptionPhrases: string[] = []
  if (optionAwareness) {
    if (optionAwareness.hesitationStrength > 0.5) {
      preferredOptionPhrases.push('どちらも', '揺れている', 'バランス')
    }
    if (optionAwareness.bridgeOptionPossible) {
      preferredOptionPhrases.push('橋渡し', '両方', '間')
    }
    if (optionAwareness.dominantOptionId) {
      preferredOptionPhrases.push('寄っている', '傾いている')
    }
  }

  // Determine what to avoid
  // Avoid over-explaining when clarity is already present
  const narrativeStrength = narrativeProtoMeanings.reduce((sum, pm) => sum + pm.strength, 0)
  const avoidOverexplaining = narrativeStrength > 0.7

  // Avoid flat summary when we have rich textures
  const avoidFlatSummary = preferredTextures.length > 2 || sensoryProtoMeanings.length > 2

  // Avoid therapy tone when directness is needed or when textures are strong
  const hasStrongTexture = sensoryProtoMeanings.some((pm) => pm.strength > 0.7)
  const avoidTherapyTone = hasStrongTexture || narrativeStrength > 0.8

  return {
    preferredTextures,
    preferredMeaningPhrases,
    preferredOptionPhrases,
    avoidOverexplaining,
    avoidFlatSummary,
    avoidTherapyTone,
  }
}
