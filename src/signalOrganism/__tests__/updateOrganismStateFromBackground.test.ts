import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../createInitialOrganismState'
import { updateOrganismStateFromBackground } from '../updateOrganismStateFromBackground'

describe('updateOrganismStateFromBackground', () => {
  it('micro pulse increments backgroundTickCount', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'micro_pulse',
      timestamp: Date.now(),
    })
    expect(updated.lifecycle.backgroundTickCount).toBe(1)
  })

  it('micro pulse slightly recovers energy', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'micro_pulse',
      timestamp: Date.now(),
    })
    expect(updated.regulation.energy).toBeGreaterThanOrEqual(initial.regulation.energy)
  })

  it('weak replay decreases replayPressure', () => {
    const initial = { ...createInitialOrganismState(), regulation: { ...createInitialOrganismState().regulation, replayPressure: 0.5 } }
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'weak_replay',
      timestamp: Date.now(),
    })
    expect(updated.regulation.replayPressure).toBeLessThan(0.5)
  })

  it('weak replay increases consolidationPressure', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'weak_replay',
      timestamp: Date.now(),
    })
    expect(updated.regulation.consolidationPressure).toBeGreaterThan(initial.regulation.consolidationPressure)
  })

  it('maintenance decreases overload', () => {
    const initial = { ...createInitialOrganismState(), regulation: { ...createInitialOrganismState().regulation, overload: 0.5 } }
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'maintenance',
      timestamp: Date.now(),
    })
    expect(updated.regulation.overload).toBeLessThan(0.5)
  })

  it('sets lastBackgroundTickAt', () => {
    const ts = Date.now()
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromBackground(initial, {
      cycleType: 'micro_pulse',
      timestamp: ts,
    })
    expect(updated.lastBackgroundTickAt).toBe(ts)
  })

  it('keeps all values in 0–1 range after many ticks', () => {
    let state = createInitialOrganismState()
    for (let i = 0; i < 50; i++) {
      const cycleType = (['micro_pulse', 'weak_replay', 'maintenance'] as const)[i % 3]!
      state = updateOrganismStateFromBackground(state, { cycleType, timestamp: Date.now() + i * 10000 })
    }
    for (const val of Object.values(state.regulation)) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })
})
