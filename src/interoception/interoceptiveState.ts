/**
 * Interoceptive State
 *
 * Phase 3: Core internal body-like regulation state.
 * This is NOT cosmetic feedback or UI decoration.
 * It causally affects threshold, inhibition, precision, coalition, replay, and action policy.
 *
 * Based on allostasis/interoception research showing that body-state prediction
 * and adjustment is a whole-brain regulatory foundation, not just emotion decoration.
 */

export type InteroceptiveState = {
  /**
   * Available processing resources (0.0 - 1.0)
   * Low energy reduces precision, increases threshold, favors hold/defer actions
   */
  energy: number

  /**
   * Current arousal/activation level (0.0 - 1.0)
   * High arousal increases sensitivity, lowers threshold, speeds transitions
   */
  arousal: number

  /**
   * Cognitive/processing overload pressure (0.0 - 1.0)
   * High overload triggers block phase, reduces coalition complexity, favors hold
   */
  overload: number

  /**
   * Pressure to recover/consolidate (0.0 - 1.0)
   * High recovery pressure triggers release phase, increases replay eligibility
   */
  recoveryPressure: number

  /**
   * Perceived social safety in interaction (0.0 - 1.0)
   * Low safety increases caution, reduces openness, favors gentle/hold actions
   */
  socialSafety: number

  /**
   * Drive to seek novel information (0.0 - 1.0)
   * High novelty hunger lowers threshold for surprise, favors explore/ask actions
   */
  noveltyHunger: number

  /**
   * Tolerance for ambiguity/uncertainty (0.0 - 1.0)
   * Low tolerance favors quick resolution, high tolerance enables bridge/hold
   */
  uncertaintyTolerance: number
}

/**
 * Create default interoceptive state (neutral/balanced)
 */
export const createDefaultInteroceptiveState = (): InteroceptiveState => ({
  energy: 0.7,
  arousal: 0.5,
  overload: 0.2,
  recoveryPressure: 0.3,
  socialSafety: 0.6,
  noveltyHunger: 0.5,
  uncertaintyTolerance: 0.5,
})
