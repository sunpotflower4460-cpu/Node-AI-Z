import { describe, expect, it } from 'vitest'
import { saveSignalModeState } from '../saveSignalModeState'
import { loadSignalModeState } from '../loadSignalModeState'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'
import type { SignalStorageAdapter } from '../signalPersistenceTypes'

const FIELD = { particles: [], links: [], recentActivations: [], assemblies: [], protoMeanings: [], crossModalBridges: [], frameCount: 0 }

function createInMemoryAdapter(): SignalStorageAdapter {
  const store = new Map<string, unknown>()
  return {
    save: async (key, val) => { store.set(key, val) },
    load: async (key) => store.get(key) ?? null,
    remove: async (key) => { store.delete(key) },
  }
}

describe('loadSignalModeState', () => {
  it('returns null when nothing is saved', async () => {
    const adapter = createInMemoryAdapter()
    const result = await loadSignalModeState(adapter)
    expect(result).toBeNull()
  })

  it('returns the saved snapshot', async () => {
    const adapter = createInMemoryAdapter()
    const snap = createSignalSnapshot({ fieldState: FIELD, personalBranch: createInitialSignalPersonalBranch(), loopState: createInitialSignalLoopState() })
    await saveSignalModeState(snap, adapter)
    const loaded = await loadSignalModeState(adapter)
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(snap.id)
  })
})
