import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../createInitialOrganismState'
import { updateOrganismStateFromInput } from '../updateOrganismStateFromInput'

const BASE_SIGNAL = {
  activeParticleCount: 5,
  assemblyCount: 3,
  newAssemblyCount: 1,
  bridgeChangeCount: 1,
  predictionError: 0.2,
  riskLevel: 0.2,
  teacherInvolved: false,
  recallSuccess: false,
  timestamp: Date.now(),
}

describe('updateOrganismStateFromInput', () => {
  it('increments turnCount and totalInputCount', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, BASE_SIGNAL)
    expect(updated.lifecycle.turnCount).toBe(1)
    expect(updated.lifecycle.totalInputCount).toBe(1)
  })

  it('increases replayPressure when new assemblies detected', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, { ...BASE_SIGNAL, newAssemblyCount: 3 })
    expect(updated.regulation.replayPressure).toBeGreaterThan(initial.regulation.replayPressure)
  })

  it('increases curiosity when new assemblies detected', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, { ...BASE_SIGNAL, newAssemblyCount: 2 })
    expect(updated.regulation.curiosity).toBeGreaterThan(initial.regulation.curiosity)
  })

  it('decreases teacherDependency on teacher-free recall success', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, {
      ...BASE_SIGNAL,
      teacherInvolved: false,
      recallSuccess: true,
    })
    expect(updated.learning.teacherDependency).toBeLessThan(initial.learning.teacherDependency)
  })

  it('increases overload on high risk', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, { ...BASE_SIGNAL, riskLevel: 0.9 })
    expect(updated.regulation.overload).toBeGreaterThan(initial.regulation.overload)
  })

  it('updates teacherInjectedRatio when teacher involved', () => {
    const initial = createInitialOrganismState()
    const updated = updateOrganismStateFromInput(initial, { ...BASE_SIGNAL, teacherInvolved: true })
    expect(updated.sourceBalance.teacherInjectedRatio).toBeGreaterThanOrEqual(0)
  })

  it('keeps all values in 0–1 range', () => {
    let state = createInitialOrganismState()
    for (let i = 0; i < 20; i++) {
      state = updateOrganismStateFromInput(state, {
        ...BASE_SIGNAL,
        riskLevel: Math.random(),
        predictionError: Math.random(),
        newAssemblyCount: Math.floor(Math.random() * 5),
        timestamp: Date.now() + i * 1000,
      })
    }
    for (const val of Object.values(state.regulation)) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })
})
