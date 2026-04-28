import type { SignalStorageAdapter } from './signalPersistenceTypes'
import { SIGNAL_MODE_STORAGE_KEY, createLocalStorageAdapter } from './saveSignalModeState'

/**
 * Reset Signal Mode state only.
 * Does NOT touch crystallized_thinking or llm_mode storage.
 */
export async function resetSignalModeState(
  adapter: SignalStorageAdapter = createLocalStorageAdapter(),
): Promise<void> {
  await adapter.remove(SIGNAL_MODE_STORAGE_KEY)
}
