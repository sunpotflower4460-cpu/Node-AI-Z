import type {
  SignalAttentionBudget,
  AttentionAllocation,
} from './signalAttentionTypes'

/**
 * Allocate attention budget across different activities.
 *
 * Distributes available budget to:
 * - Activation: firing new particles
 * - Propagation: spreading activation
 * - Replay: internal replay
 * - Teacher: binding teacher queries
 * - Consolidation: resting-state consolidation
 */
export function allocateSignalAttention(
  budget: SignalAttentionBudget,
  isResting: boolean,
  surpriseLevel: number,
): AttentionAllocation {
  const notes: string[] = []
  const available = budget.availableBudget

  if (isResting) {
    // During rest, prioritize consolidation and replay
    return {
      activationBudget: available * 0.1,
      propagationBudget: available * 0.1,
      replayBudget: available * 0.4,
      teacherBudget: available * 0.05,
      consolidationBudget: available * 0.35,
      notes: ['Resting allocation: prioritize replay and consolidation'],
    }
  }

  // During active periods
  if (surpriseLevel > 0.7) {
    // High surprise: allocate more to activation and teacher
    notes.push('High surprise: increased activation and teacher budget')
    return {
      activationBudget: available * 0.4,
      propagationBudget: available * 0.25,
      replayBudget: available * 0.1,
      teacherBudget: available * 0.2,
      consolidationBudget: available * 0.05,
      notes,
    }
  }

  // Normal allocation
  return {
    activationBudget: available * 0.3,
    propagationBudget: available * 0.3,
    replayBudget: available * 0.2,
    teacherBudget: available * 0.15,
    consolidationBudget: available * 0.05,
    notes: ['Normal allocation'],
  }
}
