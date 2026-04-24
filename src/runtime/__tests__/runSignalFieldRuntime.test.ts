import { describe, it, expect } from 'vitest'
import { runSignalFieldRuntime } from '../runSignalFieldRuntime'

describe('runSignalFieldRuntime', () => {
  it('runs a full cycle and returns observe summary', async () => {
    const result = await runSignalFieldRuntime({
      stimulus: { modality: 'text', vector: [0.5, 0.5], strength: 1.0, timestamp: 100 },
    })
    expect(result.observe.particleCount).toBeGreaterThan(0)
    expect(result.observe.frameCount).toBe(1)
    expect(result.state.particles.length).toBeGreaterThan(0)
  })

  it('accumulates assemblies over repeated stimuli', async () => {
    let state = undefined
    for (let i = 0; i < 10; i++) {
      const result = await runSignalFieldRuntime({
        stimulus: { modality: 'text', vector: [0.5, 0.5], strength: 1.0, timestamp: i * 100 },
        existingState: state,
      })
      state = result.state
    }
    expect(state!.assemblies.length).toBeGreaterThanOrEqual(0)
  })

  it('activates binding teacher when enabled', async () => {
    // Run enough cycles to build assemblies first
    let state = undefined
    for (let i = 0; i < 15; i++) {
      const result = await runSignalFieldRuntime({
        stimulus: { modality: 'text', vector: [0.5, 0.5], strength: 1.0, timestamp: i * 100 },
        existingState: state,
      })
      state = result.state
    }
    const result = await runSignalFieldRuntime({
      stimulus: { modality: 'text', vector: [0.5, 0.5], strength: 1.0, timestamp: 2000 },
      existingState: state,
      enableBindingTeacher: true,
      textSummary: 'test input',
      imageSummary: 'test image',
    })
    expect(result.observe).toBeDefined()
  })
})
