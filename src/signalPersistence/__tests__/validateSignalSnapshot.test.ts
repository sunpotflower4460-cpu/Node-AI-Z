import { describe, expect, it } from 'vitest'
import { validateSignalSnapshot } from '../validateSignalSnapshot'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('validateSignalSnapshot', () => {
  it('validates a good snapshot', () => {
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    const result = validateSignalSnapshot(snap)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects null', () => {
    expect(validateSignalSnapshot(null).valid).toBe(false)
  })

  it('rejects missing mode', () => {
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    const bad = { ...snap, metadata: { ...snap.metadata, mode: 'other' as 'signal_mode' } }
    expect(validateSignalSnapshot(bad).valid).toBe(false)
  })

  it('warns on version mismatch', () => {
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    const result = validateSignalSnapshot({ ...snap, version: 999 })
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})
