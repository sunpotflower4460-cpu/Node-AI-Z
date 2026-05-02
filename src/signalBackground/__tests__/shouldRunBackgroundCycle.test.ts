import { describe, expect, it } from 'vitest'
import { createInitialOrganismState } from '../../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../createInitialBackgroundLoopState'
import { shouldRunBackgroundCycle } from '../shouldRunBackgroundCycle'

describe('shouldRunBackgroundCycle', () => {
  it('returns should=false when no time has elapsed', () => {
    const now = Date.now()
    const organism = createInitialOrganismState()
    const background = { ...createInitialBackgroundLoopState(), lastTickAt: now }
    const result = shouldRunBackgroundCycle(now, organism, background, now)
    expect(result.should).toBe(false)
  })

  it('returns micro_pulse after sufficient elapsed time (since last tick)', () => {
    const organism = createInitialOrganismState()
    // Simulate a recent maintenance tick, so maintenance won't fire
    const recentMaintenance = Date.now() - 5000
    const background = {
      ...createInitialBackgroundLoopState(),
      lastTickAt: recentMaintenance,
      lastCycleType: 'maintenance' as const,
    }
    const now = Date.now() + 20_000 // 20 seconds after start
    const result = shouldRunBackgroundCycle(now, organism, background)
    expect(result.should).toBe(true)
    expect(result.cycleType).toBe('micro_pulse')
  })

  it('returns maintenance after 1 minute with no ticks', () => {
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    const now = Date.now() + 70_000 // > 1 minute
    const result = shouldRunBackgroundCycle(now, organism, background)
    expect(result.should).toBe(true)
    expect(result.cycleType).toBe('maintenance')
  })

  it('returns weak_replay when pressure is high and inputs are quiet', () => {
    const organism = {
      ...createInitialOrganismState(),
      regulation: { ...createInitialOrganismState().regulation, replayPressure: 0.6 },
      recent: {
        ...createInitialOrganismState().recent,
        replayQueueIds: ['a1', 'a2'],
      },
    }
    const background = { ...createInitialBackgroundLoopState(), lastTickAt: Date.now() - 5000 }
    const lastInputAt = Date.now() - 20_000 // no input for 20 seconds
    const result = shouldRunBackgroundCycle(Date.now(), organism, background, lastInputAt)
    expect(result.should).toBe(true)
    expect(result.cycleType).toBe('weak_replay')
  })
})
