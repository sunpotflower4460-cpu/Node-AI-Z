import { describe, expect, it } from 'vitest'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { restoreSignalSnapshot } from '../restoreSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('restoreSignalSnapshot', () => {
  it('restores a valid snapshot', () => {
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    const result = restoreSignalSnapshot(snap)
    expect(result).not.toBeNull()
    expect(result!.fieldState).toBeDefined()
    expect(result!.personalBranch).toBeDefined()
    expect(result!.loopState).toBeDefined()
  })

  it('returns null for invalid snapshot', () => {
    const result = restoreSignalSnapshot({ id: '', version: 0, createdAt: 0, updatedAt: 0, signalFieldState: null, signalPersonalBranch: null, signalLoopState: null, metadata: { mode: 'signal_mode' } })
    expect(result).toBeNull()
  })
})
