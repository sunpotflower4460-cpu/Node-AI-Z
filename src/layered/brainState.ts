import type { SemanticFrame } from './L4/types'
import type { Decision } from './L6/types'
import type { Prediction } from './prediction/types'

export type BrainState = {
  turnCount: number
  lastSemantic: SemanticFrame | null
  lastDecision: Decision | null
  lastUtterance: string | null
  prediction: Prediction
  mood: 'neutral' | 'light' | 'heavy' | 'uncertain'
  recentTopics: string[]
}

/**
 * Creates the default layered-thinking brain state.
 *
 * @returns Initial brain state.
 */
export function createInitialBrainState(): BrainState {
  return {
    turnCount: 0,
    lastSemantic: null,
    lastDecision: null,
    lastUtterance: null,
    prediction: {
      expectedNeed: null,
      expectedTopic: null,
      expectedSentenceType: null,
    },
    mood: 'neutral',
    recentTopics: [],
  }
}
