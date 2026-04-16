import type { SessionLearningState, PathwayStrengthMap } from './types'

/** How much strength a fired pathway gains per turn */
const SESSION_REINFORCE_RATE = 0.1
/** How much unfired pathways decay each turn */
const SESSION_DECAY_RATE = 0.02

/**
 * Create a blank session learning state.
 */
export const createSessionLearningState = (sessionId: string): SessionLearningState => ({
  sessionId,
  pathwayStrengths: {},
  reinforcedKeys: [],
  turnCount: 0,
})

/**
 * Update session-level pathway strengths for one turn.
 *
 * Fired keys are reinforced; all other known keys decay slightly.
 * This is purely in-memory and is discarded at session end.
 */
export const updateSessionLearning = (
  state: SessionLearningState,
  firedKeys: string[],
): SessionLearningState => {
  const next: PathwayStrengthMap = { ...state.pathwayStrengths }
  const firedSet = new Set(firedKeys)

  // Reinforce fired pathways
  for (const key of firedKeys) {
    next[key] = Math.min(1, (next[key] ?? 0) + SESSION_REINFORCE_RATE)
  }

  // Mild decay for unfired pathways that have built up strength
  for (const key of Object.keys(next)) {
    if (!firedSet.has(key)) {
      const decayed = next[key] - SESSION_DECAY_RATE
      if (decayed <= 0) {
        delete next[key]
      } else {
        next[key] = decayed
      }
    }
  }

  return {
    ...state,
    pathwayStrengths: next,
    reinforcedKeys: [...new Set([...state.reinforcedKeys, ...firedKeys])],
    turnCount: state.turnCount + 1,
  }
}
