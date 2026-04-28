import { describe, expect, it } from 'vitest'
import { saveSignalModeState } from '../saveSignalModeState'
import { loadSignalModeState } from '../loadSignalModeState'
import { resetSignalModeState } from '../resetSignalModeState'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'
import type { SignalStorageAdapter } from '../signalPersistenceTypes'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

describe('resetSignalModeState', () => {
  it('removes only the signal mode key, not other keys', async () => {
    const store = new Map<string, unknown>()
    const adapter: SignalStorageAdapter = {
      save: async (key, val) => { store.set(key, val) },
      load: async (key) => store.get(key) ?? null,
      remove: async (key) => { store.delete(key) },
    }
    store.set('nodeaiz:crystal:session-brain', 'crystallized-data')

    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    await saveSignalModeState(snap, adapter)
    await resetSignalModeState(adapter)

    const loaded = await loadSignalModeState(adapter)
    expect(loaded).toBeNull()
    expect(store.get('nodeaiz:crystal:session-brain')).toBe('crystallized-data')
  })
})
