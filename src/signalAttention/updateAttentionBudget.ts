import type { SignalAttentionBudget } from './signalAttentionTypes'

/**
 * Update attention budget based on usage and rest.
 *
 * Tracks fatigue from high activity and recovery during rest.
 */
export function updateAttentionBudget(
  budget: SignalAttentionBudget,
  activeParticleCount: number,
  teacherUsed: boolean,
  isResting: boolean,
): SignalAttentionBudget {
  let fatigue = budget.fatigue
  let recovery = budget.recovery

  // Increase fatigue if particle count is high
  if (activeParticleCount > 50) {
    fatigue = Math.min(1.0, fatigue + 0.05)
  }

  // Increase fatigue if teacher was heavily used
  if (teacherUsed) {
    fatigue = Math.min(1.0, fatigue + 0.03)
  }

  // Recovery increases during rest
  if (isResting) {
    recovery = Math.min(1.0, recovery + 0.1)
    fatigue = Math.max(0.0, fatigue - 0.05)
  } else {
    recovery = Math.max(0.5, recovery - 0.02)
  }

  // Learning rate multiplier decreases with fatigue
  const learningRateMultiplier = Math.max(0.3, 1.0 - fatigue * 0.5)

  // Available budget decreases with fatigue
  const availableBudget = budget.totalBudget * (1.0 - fatigue * 0.4) * recovery

  return {
    ...budget,
    availableBudget,
    fatigue,
    recovery,
    learningRateMultiplier,
  }
}
