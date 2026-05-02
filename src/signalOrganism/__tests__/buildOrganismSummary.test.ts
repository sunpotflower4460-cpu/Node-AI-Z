import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../createInitialOrganismState'
import { buildOrganismSummary } from '../buildOrganismSummary'

describe('buildOrganismSummary', () => {
  it('produces a summary from initial state', () => {
    const state = createInitialOrganismState()
    const summary = buildOrganismSummary(state)
    expect(summary.energy).toBeCloseTo(0.65, 1)
    expect(summary.curiosity).toBeCloseTo(0.45, 1)
    expect(summary.regulationLabel).toBe('stable')
  })

  it('returns overloaded label when overload is high', () => {
    const state = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, overload: 0.8 },
    }
    expect(buildOrganismSummary(state).regulationLabel).toBe('overloaded')
  })

  it('returns depleted label when energy is low', () => {
    const state = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, energy: 0.1, overload: 0.05 },
    }
    expect(buildOrganismSummary(state).regulationLabel).toBe('depleted')
  })

  it('returns active label when curiosity is high', () => {
    const state = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, curiosity: 0.9, overload: 0.05, energy: 0.5 },
    }
    expect(buildOrganismSummary(state).regulationLabel).toBe('active')
  })
})
