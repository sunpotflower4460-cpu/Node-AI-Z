import { describe, expect, it } from 'vitest'
import { createInitialBackgroundLoopState } from '../createInitialBackgroundLoopState'
import { buildBackgroundLoopSummary } from '../buildBackgroundLoopSummary'

describe('buildBackgroundLoopSummary', () => {
  it('builds a summary from initial state', () => {
    const state = createInitialBackgroundLoopState()
    const summary = buildBackgroundLoopSummary(state)
    expect(summary.mode).toBe('idle')
    expect(summary.isRunning).toBe(false)
    expect(summary.tickCount).toBe(0)
    expect(summary.pendingReplayCount).toBe(0)
    expect(summary.lastError).toBeUndefined()
  })

  it('reflects pending replay count', () => {
    const state = {
      ...createInitialBackgroundLoopState(),
      pendingReplayIds: ['a', 'b', 'c'],
    }
    const summary = buildBackgroundLoopSummary(state)
    expect(summary.pendingReplayCount).toBe(3)
  })

  it('reflects last error', () => {
    const state = {
      ...createInitialBackgroundLoopState(),
      health: { loopLoad: 0, skippedTicks: 0, lastError: 'test error' },
    }
    const summary = buildBackgroundLoopSummary(state)
    expect(summary.lastError).toBe('test error')
  })})
