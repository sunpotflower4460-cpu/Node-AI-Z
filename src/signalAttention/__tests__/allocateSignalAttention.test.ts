import { describe, it, expect } from 'vitest'
import { allocateSignalAttention } from '../allocateSignalAttention'
import { createInitialAttentionBudget } from '../createInitialAttentionBudget'

describe('allocateSignalAttention', () => {
  it('should prioritize consolidation during rest', () => {
    const budget = createInitialAttentionBudget()

    const allocation = allocateSignalAttention(budget, true, 0.3)

    expect(allocation.consolidationBudget).toBeGreaterThan(allocation.activationBudget)
    expect(allocation.replayBudget).toBeGreaterThan(allocation.activationBudget)
  })

  it('should increase activation budget during high surprise', () => {
    const budget = createInitialAttentionBudget()

    const allocation = allocateSignalAttention(budget, false, 0.8)

    expect(allocation.activationBudget).toBeGreaterThan(
      budget.availableBudget * 0.35,
    )
  })

  it('should balance allocation during normal activity', () => {
    const budget = createInitialAttentionBudget()

    const allocation = allocateSignalAttention(budget, false, 0.5)

    const total =
      allocation.activationBudget +
      allocation.propagationBudget +
      allocation.replayBudget +
      allocation.teacherBudget +
      allocation.consolidationBudget

    expect(total).toBeCloseTo(budget.availableBudget, 0)
  })
})
