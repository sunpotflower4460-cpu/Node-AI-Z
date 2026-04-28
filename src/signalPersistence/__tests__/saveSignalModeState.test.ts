import { describe, expect, it } from 'vitest'
import { saveSignalModeState } from '../saveSignalModeState'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'
import type { SignalStorageAdapter } from '../signalPersistenceTypes'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

function createInMemoryAdapter(): { adapter: SignalStorageAdapter; store: Map<string, unknown> } {
  const store = new Map<string, unknown>()
  return {
    store,
    adapter: {
      save: async (key, val) => { store.set(key, val) },
      load: async (key) => store.get(key) ?? null,
      remove: async (key) => { store.delete(key) },
    },
  }
}

describe('saveSignalModeState', () => {
  it('saves the snapshot to the adapter', async () => {
    const { adapter, store } = createInMemoryAdapter()
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    await saveSignalModeState(snap, adapter)
    expect(store.size).toBe(1)
  })
})
