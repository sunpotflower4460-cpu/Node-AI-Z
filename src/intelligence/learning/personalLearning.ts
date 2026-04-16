import type { PersonalLearningState, PathwayStrengthMap } from './types'

/** How much strength a fired pathway gains per turn (slower than session) */
const PERSONAL_REINFORCE_RATE = 0.05
/** How much unfired pathways decay each turn */
const PERSONAL_DECAY_RATE = 0.01

/**
 * Create a blank personal learning state.
 */
export const createPersonalLearningState = (): PersonalLearningState => ({
  pathwayStrengths: {},
  lastUpdated: new Date().toISOString(),
  totalTurns: 0,
  somaticMarkers: [],
})

/**
 * Update personal learning state for one turn.
 *
 * Reinforcement is slower than session learning so personal weights
 * represent durable, cross-session patterns rather than ephemeral trends.
 */
export const updatePersonalLearning = (
  state: PersonalLearningState,
  firedKeys: string[],
): PersonalLearningState => {
  const next: PathwayStrengthMap = { ...state.pathwayStrengths }
  const firedSet = new Set(firedKeys)

  // Reinforce fired pathways
  for (const key of firedKeys) {
    next[key] = Math.min(1, (next[key] ?? 0) + PERSONAL_REINFORCE_RATE)
  }

  // Slower decay for unfired pathways
  for (const key of Object.keys(next)) {
    if (!firedSet.has(key)) {
      const decayed = next[key] - PERSONAL_DECAY_RATE
      if (decayed <= 0) {
        delete next[key]
      } else {
        next[key] = decayed
      }
    }
  }

  return {
    pathwayStrengths: next,
    lastUpdated: new Date().toISOString(),
    totalTurns: state.totalTurns + 1,
  }
}
