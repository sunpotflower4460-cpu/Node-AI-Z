import { describe, expect, it } from 'vitest'
import { createInitialBackgroundLoopState } from '../createInitialBackgroundLoopState'

describe('createInitialBackgroundLoopState', () => {
  it('creates a state with mode idle', () => {
    const state = createInitialBackgroundLoopState()
    expect(state.mode).toBe('idle')
  })

  it('starts with isRunning false', () => {
    expect(createInitialBackgroundLoopState().isRunning).toBe(false)
  })

  it('starts with tickCount 0', () => {
    expect(createInitialBackgroundLoopState().tickCount).toBe(0)
  })

  it('starts with empty pending queues', () => {
    const state = createInitialBackgroundLoopState()
    expect(state.pendingReplayIds).toHaveLength(0)
    expect(state.pendingMaintenanceTasks).toHaveLength(0)
  })

  it('starts with healthy health values', () => {
    const state = createInitialBackgroundLoopState()
    expect(state.health.loopLoad).toBe(0)
    expect(state.health.skippedTicks).toBe(0)
    expect(state.health.lastError).toBeUndefined()
  })
})
