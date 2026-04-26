import type { SignalAttentionBudget } from './signalAttentionTypes'

/**
 * Compute learning rate multiplier from attention budget.
 *
 * Returns a factor (0.3 - 1.5) to multiply base learning rates by.
 * - High fatigue reduces learning rate
 * - High surprise with available budget increases learning rate slightly
 * - High teacher cost reduces teacher-based learning rate
 */
export function computeLearningRateFromBudget(
  budget: SignalAttentionBudget,
  surpriseLevel: number,
): {
  hebbianRateMultiplier: number
  bridgeRateMultiplier: number
  assemblyRateMultiplier: number
  teacherRateMultiplier: number
} {
  const baseFatigueFactor = budget.learningRateMultiplier // Already accounts for fatigue

  // Hebbian learning (particle-level): most affected by fatigue
  const hebbianRateMultiplier = baseFatigueFactor

  // Bridge formation: somewhat affected by fatigue
  const bridgeRateMultiplier = baseFatigueFactor * 0.9 + 0.1

  // Assembly detection: less affected by fatigue
  const assemblyRateMultiplier = baseFatigueFactor * 0.8 + 0.2

  // Teacher-based learning: reduced if teacher cost is too high
  const teacherCostPenalty =
    budget.teacherCost > 50 ? Math.max(0.5, 1.0 - (budget.teacherCost - 50) / 100) : 1.0
  const teacherRateMultiplier = baseFatigueFactor * teacherCostPenalty

  // Slight boost if surprise is high and we have available budget
  const surpriseBoost =
    surpriseLevel > 0.7 && budget.availableBudget > 50 ? 1.1 : 1.0

  return {
    hebbianRateMultiplier: hebbianRateMultiplier * surpriseBoost,
    bridgeRateMultiplier: bridgeRateMultiplier * surpriseBoost,
    assemblyRateMultiplier: assemblyRateMultiplier * surpriseBoost,
    teacherRateMultiplier,
  }
}
