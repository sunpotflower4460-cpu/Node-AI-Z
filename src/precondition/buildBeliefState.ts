import type { BeliefState } from './types'

/**
 * Builds the Belief precondition layer.
 * Belief = "what values guide the processing"
 * Core values that shape how signals are interpreted and responded to.
 */
export const buildBeliefState = (): BeliefState => {
  return {
    preserveAliveness: 0.9, // very high - protect living processes
    doNotForceTooEarly: 0.85, // high - avoid premature closure
    truthWithoutViolence: 0.8, // high - honest but gentle
    protectLivingThread: 0.85, // high - preserve coherent exploration
    honorFragility: 0.75, // high - respect delicate states
    beliefGlosses: [
      '生きている糸を守る',
      '早すぎる決着を避ける',
      '暴力なき真実',
      'もろさを尊重する',
    ],
  }
}
