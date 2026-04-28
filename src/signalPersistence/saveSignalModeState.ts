import type { SignalModeSnapshot, SignalStorageAdapter } from './signalPersistenceTypes'

export const SIGNAL_MODE_STORAGE_KEY = 'nodeaiz:signal:snapshot'

export function createLocalStorageAdapter(): SignalStorageAdapter {
  return {
    save: async (key: string, value: unknown) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // storage full or unavailable
      }
    },
    load: async (key: string) => {
      try {
        const raw = localStorage.getItem(key)
        if (raw == null) return null
        return JSON.parse(raw) as unknown
      } catch {
        return null
      }
    },
    remove: async (key: string) => {
      try {
        localStorage.removeItem(key)
      } catch {
        // unavailable
      }
    },
  }
}

export async function saveSignalModeState(
  snapshot: SignalModeSnapshot,
  adapter: SignalStorageAdapter = createLocalStorageAdapter(),
): Promise<void> {
  await adapter.save(SIGNAL_MODE_STORAGE_KEY, snapshot)
}
