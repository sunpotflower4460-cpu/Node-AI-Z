import { describe, expect, it } from 'vitest'
import { buildBackgroundViewModel } from '../buildBackgroundViewModel'
import { createInitialOrganismState } from '../../../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../../../signalBackground/createInitialBackgroundLoopState'
import { buildOrganismSummary } from '../../../signalOrganism/buildOrganismSummary'
import { buildBackgroundLoopSummary } from '../../../signalBackground/buildBackgroundLoopSummary'

describe('buildBackgroundViewModel', () => {
  it('builds a view model from initial state', () => {
    const organism = buildOrganismSummary(createInitialOrganismState())
    const background = buildBackgroundLoopSummary(createInitialBackgroundLoopState())
    const vm = buildBackgroundViewModel(organism, background)

    expect(vm.organism.energy).toBeCloseTo(0.65, 1)
    expect(vm.organism.regulationLabel).toBe('stable')
    expect(vm.background.mode).toBe('idle')
    expect(vm.background.isRunning).toBe(false)
    expect(vm.background.lastTickAgo).toBe('never')
  })

  it('reflects pending replay count in background', () => {
    const organism = buildOrganismSummary(createInitialOrganismState())
    const bgState = { ...createInitialBackgroundLoopState(), pendingReplayIds: ['a', 'b'] }
    const background = buildBackgroundLoopSummary(bgState)
    const vm = buildBackgroundViewModel(organism, background)
    expect(vm.background.pendingReplayCount).toBe(2)
  })

  it('reflects error status', () => {
    const organism = buildOrganismSummary(createInitialOrganismState())
    const bgState = {
      ...createInitialBackgroundLoopState(),
      health: { loopLoad: 0.5, skippedTicks: 1, lastError: 'test err' },
    }
    const background = buildBackgroundLoopSummary(bgState)
    const vm = buildBackgroundViewModel(organism, background)
    expect(vm.background.hasError).toBe(true)
    expect(vm.background.lastError).toBe('test err')
  })
})
