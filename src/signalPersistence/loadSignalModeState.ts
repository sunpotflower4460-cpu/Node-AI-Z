import type { SignalModeSnapshot, SignalStorageAdapter } from './signalPersistenceTypes'
import { SIGNAL_MODE_STORAGE_KEY, createLocalStorageAdapter } from './saveSignalModeState'
import { validateSignalSnapshot } from './validateSignalSnapshot'

export async function loadSignalModeState(
  adapter: SignalStorageAdapter = createLocalStorageAdapter(),
): Promise<SignalModeSnapshot | null> {
  const raw = await adapter.load(SIGNAL_MODE_STORAGE_KEY)
  if (raw == null) return null
  const validation = validateSignalSnapshot(raw)
  if (!validation.valid) return null
  return raw as SignalModeSnapshot
}
