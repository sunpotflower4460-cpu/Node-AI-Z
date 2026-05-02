import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../createInitialOrganismState'

describe('createInitialOrganismState', () => {
  it('creates an organism state with a unique id', () => {
    const s1 = createInitialOrganismState()
    const s2 = createInitialOrganismState()
    expect(s1.organismId).toBeTruthy()
    expect(s1.organismId).not.toBe(s2.organismId)
  })

  it('starts with non-zero baseline activity', () => {
    const state = createInitialOrganismState()
    expect(state.regulation.energy).toBeGreaterThan(0)
    expect(state.continuity.internalRhythm).toBeGreaterThan(0)
    expect(state.continuity.baselineActivation).toBeGreaterThan(0)
  })

  it('starts with all lifecycle counts at zero', () => {
    const state = createInitialOrganismState()
    expect(state.lifecycle.turnCount).toBe(0)
    expect(state.lifecycle.backgroundTickCount).toBe(0)
    expect(state.lifecycle.totalInputCount).toBe(0)
    expect(state.lifecycle.totalReplayCount).toBe(0)
  })

  it('starts with all values in 0–1 range', () => {
    const state = createInitialOrganismState()
    const reg = state.regulation
    for (const key of Object.keys(reg)) {
      const val = reg[key as keyof typeof reg]
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
    const cont = state.continuity
    for (const key of Object.keys(cont)) {
      const val = cont[key as keyof typeof cont]
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })

  it('has empty recent queues', () => {
    const state = createInitialOrganismState()
    expect(state.recent.recentAssemblyIds).toHaveLength(0)
    expect(state.recent.replayQueueIds).toHaveLength(0)
  })
})
