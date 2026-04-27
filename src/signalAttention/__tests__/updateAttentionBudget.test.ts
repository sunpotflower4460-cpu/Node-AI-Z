import { describe, it, expect } from 'vitest'
import { createInitialAttentionBudget } from '../createInitialAttentionBudget'
import { updateAttentionBudget } from '../updateAttentionBudget'

describe('updateAttentionBudget', () => {
  it('should increase fatigue with high particle count', () => {
    const budget = createInitialAttentionBudget()

    const updated = updateAttentionBudget(budget, 100, false, false)

    expect(updated.fatigue).toBeGreaterThan(budget.fatigue)
  })

  it('should increase fatigue when teacher is used', () => {
    const budget = createInitialAttentionBudget()

    const updated = updateAttentionBudget(budget, 20, true, false)

    expect(updated.fatigue).toBeGreaterThan(budget.fatigue)
  })

  it('should increase recovery during rest', () => {
    const budget = {
      ...createInitialAttentionBudget(),
      recovery: 0.6,
      fatigue: 0.3,
    }

    const updated = updateAttentionBudget(budget, 10, false, true)

    expect(updated.recovery).toBeGreaterThan(budget.recovery)
    expect(updated.fatigue).toBeLessThan(budget.fatigue)
  })

  it('should decrease learning rate with high fatigue', () => {
    const budget = {
      ...createInitialAttentionBudget(),
      fatigue: 0.8,
    }

    const updated = updateAttentionBudget(budget, 30, false, false)

    expect(updated.learningRateMultiplier).toBeLessThan(1.0)
  })
})
