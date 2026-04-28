import type { SignalModeSnapshot } from './signalPersistenceTypes'
import { SIGNAL_SNAPSHOT_VERSION } from './signalPersistenceTypes'

export type SnapshotValidationResult = {
  valid: boolean
  warnings: string[]
  errors: string[]
}

export function validateSignalSnapshot(snapshot: unknown): SnapshotValidationResult {
  const warnings: string[] = []
  const errors: string[] = []

  if (!snapshot || typeof snapshot !== 'object') {
    return { valid: false, warnings, errors: ['snapshot is not an object'] }
  }

  const snap = snapshot as Record<string, unknown>

  if (!snap.id || typeof snap.id !== 'string') {
    errors.push('missing or invalid id')
  }
  if (!snap.metadata || typeof snap.metadata !== 'object') {
    errors.push('missing metadata')
  } else {
    const meta = snap.metadata as Record<string, unknown>
    if (meta.mode !== 'signal_mode') {
      errors.push('metadata.mode is not signal_mode')
    }
  }
  if (!snap.signalFieldState) {
    errors.push('missing signalFieldState')
  }
  if (!snap.signalPersonalBranch) {
    errors.push('missing signalPersonalBranch')
  }
  if (!snap.signalLoopState) {
    errors.push('missing signalLoopState')
  }

  if (typeof snap.version === 'number' && snap.version !== SIGNAL_SNAPSHOT_VERSION) {
    warnings.push(`version mismatch: snapshot=${snap.version}, current=${SIGNAL_SNAPSHOT_VERSION}`)
  }

  try {
    const jsonLen = JSON.stringify(snapshot).length
    if (jsonLen > 5_000_000) {
      warnings.push(`snapshot JSON is very large (${jsonLen} bytes). Consider pruning.`)
    }
  } catch {
    errors.push('snapshot contains circular references or cannot be serialized')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

export type { SignalModeSnapshot }
