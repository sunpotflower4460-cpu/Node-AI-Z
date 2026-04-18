import type { UtteranceIntent, UtteranceShape } from './types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'

export type DeriveUtteranceShapeInput = {
  utteranceIntent: UtteranceIntent
  optionAwareness?: OptionAwareness
  narrativeProtoMeanings: ProtoMeaning[]
  sensoryProtoMeanings: ProtoMeaning[]
}

/**
 * Derive UtteranceShape from UtteranceIntent
 *
 * Decides HOW to structure the utterance based on what we want to communicate.
 */
export const deriveUtteranceShape = ({
  utteranceIntent,
  optionAwareness,
  sensoryProtoMeanings,
}: DeriveUtteranceShapeInput): UtteranceShape => {
  const { primaryMove, structureNeed, ambiguityTolerance } = utteranceIntent

  // Determine opening strategy
  let openWith: UtteranceShape['openWith'] = 'meaning'

  switch (primaryMove) {
    case 'hold':
    case 'reflect':
      // Start with texture when holding or reflecting
      openWith = sensoryProtoMeanings.length > 0 ? 'texture' : 'meaning'
      break

    case 'option_compare':
    case 'bridge_suggest':
      // Start with options when that's the focus
      openWith = 'option'
      break

    case 'gentle_probe':
      // Start with question
      openWith = 'question'
      break

    case 'structured_answer':
      // Direct answer when structure is high
      openWith = structureNeed > 0.6 ? 'direct_answer' : 'meaning'
      break

    case 'soft_answer':
      // Meaning-first for soft answers
      openWith = 'meaning'
      break
  }

  // Determine inclusions
  const includeContrast = ambiguityTolerance > 0.5 && sensoryProtoMeanings.length > 1
  const includeOptionBalance = !!optionAwareness && optionAwareness.confidence > 0.4
  const includeBridge = primaryMove === 'bridge_suggest' || (optionAwareness?.bridgeOptionPossible ?? false)
  const includeQuestionBack = primaryMove === 'gentle_probe' || ambiguityTolerance > 0.7

  // Determine sentence count
  let maxSentences = 3

  if (primaryMove === 'structured_answer') {
    maxSentences = 5
  } else if (primaryMove === 'hold' || primaryMove === 'reflect') {
    maxSentences = 2
  } else if (includeOptionBalance) {
    maxSentences = 4
  }

  return {
    openWith,
    includeContrast,
    includeOptionBalance,
    includeBridge,
    includeQuestionBack,
    maxSentences,
  }
}
