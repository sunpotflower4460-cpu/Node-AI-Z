import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../createInitialBackgroundLoopState'
import { runMicroPulse } from '../runMicroPulse'
import { runWeakReplayTick } from '../runWeakReplayTick'
import { runMaintenanceTick } from '../runMaintenanceTick'

const now = Date.now()

describe('runMicroPulse', () => {
  it('increments backgroundTickCount', () => {
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    const result = runMicroPulse(organism, background, now)
    expect(result.organism.lifecycle.backgroundTickCount).toBe(1)
  })

  it('sets lastCycleType to micro_pulse', () => {
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    const result = runMicroPulse(organism, background, now)
    expect(result.background.lastCycleType).toBe('micro_pulse')
  })

  it('slightly decays selfEcho', () => {
    const organism = { ...createInitialOrganismState(), continuity: { ...createInitialOrganismState().continuity, selfEcho: 0.5 } }
    const background = createInitialBackgroundLoopState()
    const result = runMicroPulse(organism, background, now)
    expect(result.organism.continuity.selfEcho).toBeLessThan(0.5)
  })

  it('returns notes array', () => {
    const result = runMicroPulse(createInitialOrganismState(), createInitialBackgroundLoopState(), now)
    expect(result.notes.length).toBeGreaterThan(0)
  })
})

describe('runWeakReplayTick', () => {
  it('decreases replayPressure', () => {
    const organism = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, replayPressure: 0.6 },
      recent: {
        ...createInitialOrganismState().recent,
        replayQueueIds: ['a1', 'a2', 'a3'],
      },
    }
    const result = runWeakReplayTick(organism, createInitialBackgroundLoopState(), now)
    expect(result.organism.regulation.replayPressure).toBeLessThan(0.6)
  })

  it('removes replayed items from replay queue', () => {
    const organism = {
      ...createInitialOrganismState(),
      recent: {
        ...createInitialOrganismState().recent,
        replayQueueIds: ['a1', 'a2', 'a3', 'a4'],
      },
    }
    const result = runWeakReplayTick(organism, createInitialBackgroundLoopState(), now)
    expect(result.organism.recent.replayQueueIds.length).toBeLessThan(4)
  })

  it('increments totalReplayCount', () => {
    const organism = createInitialOrganismState()
    const result = runWeakReplayTick(organism, createInitialBackgroundLoopState(), now)
    expect(result.organism.lifecycle.totalReplayCount).toBeGreaterThan(organism.lifecycle.totalReplayCount)
  })
})

describe('runMaintenanceTick', () => {
  it('trims oversized recentAssemblyIds', () => {
    const ids = Array.from({ length: 30 }, (_, i) => `a${i}`)
    const organism = {
      ...createInitialOrganismState(),
      recent: { ...createInitialOrganismState().recent, recentAssemblyIds: ids },
    }
    const result = runMaintenanceTick(organism, createInitialBackgroundLoopState(), now)
    expect(result.organism.recent.recentAssemblyIds.length).toBeLessThanOrEqual(20)
  })

  it('decreases overload', () => {
    const organism = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, overload: 0.5 },
    }
    const result = runMaintenanceTick(organism, createInitialBackgroundLoopState(), now)
    expect(result.organism.regulation.overload).toBeLessThan(0.5)
  })

  it('clears pendingMaintenanceTasks', () => {
    const background = {
      ...createInitialBackgroundLoopState(),
      pendingMaintenanceTasks: ['task1', 'task2'],
    }
    const result = runMaintenanceTick(createInitialOrganismState(), background, now)
    expect(result.background.pendingMaintenanceTasks).toHaveLength(0)
  })
})
