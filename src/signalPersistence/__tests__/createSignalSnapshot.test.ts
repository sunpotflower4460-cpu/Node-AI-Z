import { describe, expect, it } from 'vitest'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'

const EMPTY_FIELD_STATE = {
  particles: [],
  links: [],
  recentActivations: [],
  assemblies: [],
  protoMeanings: [],
  crossModalBridges: [],
  frameCount: 0,
}

describe('createSignalSnapshot', () => {
  it('creates a snapshot with mode=signal_mode', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    expect(snap.metadata.mode).toBe('signal_mode')
    expect(snap.id).toBeTruthy()
    expect(snap.version).toBeGreaterThan(0)
  })

  it('includes field state metadata', () => {
    const snap = createSignalSnapshot({
      fieldState: {
        ...EMPTY_FIELD_STATE,
        particles: [{ id: 'p1', x: 0, y: 0, activation: 0.5, threshold: 0.3, refractory: 0, decayRate: 0.1 }],
      },
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    expect(snap.metadata.particleCount).toBe(1)
  })
})
