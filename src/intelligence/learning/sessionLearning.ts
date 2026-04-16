import type { SessionLearningState, PathwayStrengthMap } from './types'
import type { PredictionState } from '../predictive/types'

/** How much strength a fired pathway gains per turn */
const SESSION_REINFORCE_RATE = 0.1
/** How much unfired pathways decay each turn */
const SESSION_DECAY_RATE = 0.02
/** Smoothing factor for rolling activity average (exponential moving average) */
const ACTIVITY_EMA_ALPHA = 0.3
/** Afterglow fade rate per turn (multiplicative) */
const AFTERGLOW_FADE = 0.6
/** Maximum afterglow value */
const AFTERGLOW_MAX = 0.2
/**
 * Field intensity threshold above which afterglow begins to accumulate.
 * Sessions with peak intensity above this value leave a mild residual
 * activation on the following turn.
 */
const AFTERGLOW_INTENSITY_THRESHOLD = 0.6
/**
 * Rate at which afterglow grows when field intensity exceeds the threshold.
 * Small value (0.05) keeps the afterglow effect subtle.
 */
const AFTERGLOW_GROWTH_RATE = 0.05

/**
 * Create a blank session learning state.
 */
export const createSessionLearningState = (sessionId: string): SessionLearningState => ({
  sessionId,
  pathwayStrengths: {},
  reinforcedKeys: [],
  turnCount: 0,
  recentActivityAverage: 0.5,
  recentFieldIntensity: 0,
  recentAfterglow: 0,
})

/**
 * Update session-level pathway strengths for one turn.
 *
 * Fired keys are reinforced; all other known keys decay slightly.
 * This is purely in-memory and is discarded at session end.
 *
 * Additionally updates ISR v2.2 activity tracking fields:
 *   - recentActivityAverage (EMA of fieldIntensity)
 *   - recentFieldIntensity
 *   - recentAfterglow (fades unless field was intense)
 *
 * ISR v2.3: accepts an optional nextPredictionState to carry the prediction
 * prior forward to the next turn.
 */
export const updateSessionLearning = (
  state: SessionLearningState,
  firedKeys: string[],
  fieldIntensity = 0,
  nextPredictionState?: PredictionState,
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

  // ── ISR v2.2 activity tracking ───────────────────────────────────────────
  const prevAvg = state.recentActivityAverage ?? 0.5
  const nextAvg = prevAvg + ACTIVITY_EMA_ALPHA * (fieldIntensity - prevAvg)

  const prevAfterglow = state.recentAfterglow ?? 0
  // Afterglow rises slightly when field was intense, fades otherwise
  const rawAfterglow =
    fieldIntensity > AFTERGLOW_INTENSITY_THRESHOLD
      ? Math.min(AFTERGLOW_MAX, prevAfterglow + fieldIntensity * AFTERGLOW_GROWTH_RATE)
      : prevAfterglow * AFTERGLOW_FADE

  return {
    ...state,
    pathwayStrengths: next,
    reinforcedKeys: [...new Set([...state.reinforcedKeys, ...firedKeys])],
    turnCount: state.turnCount + 1,
    recentActivityAverage: Math.max(0, Math.min(1, nextAvg)),
    recentFieldIntensity: Math.max(0, Math.min(1, fieldIntensity)),
    recentAfterglow: Math.max(0, Math.min(AFTERGLOW_MAX, rawAfterglow)),
    predictionState: nextPredictionState ?? state.predictionState,
  }
}
