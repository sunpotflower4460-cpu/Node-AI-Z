/**
 * Restore Executor
 * Executes restore operations with safety snapshot creation
 *
 * Phase M8: Snapshot generation management
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { RestoreExecutionResult } from './types'
import { createSnapshot, saveSnapshotLocal, loadSnapshotLocal } from './snapshotManager'
import { addSnapshotCatalogEntry } from './snapshotCatalog'
import { localBrainPersistence } from './localBrainPersistence'
import { remoteBrainPersistence } from './remoteBrainPersistence'
import { addJournalEvent } from './journalWriter'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Restore from a specific snapshot
 * Creates safety snapshot before restoring
 */
export const restoreFromSnapshot = async (
  sessionId: string,
  snapshotId: string,
  sourceTarget: 'local' | 'remote',
  currentState: SessionBrainState | undefined
): Promise<RestoreExecutionResult> => {
  const notes: string[] = []

  try {
    // Step 1: Load target snapshot
    notes.push(`Loading snapshot ${snapshotId}...`)

    let targetState: SessionBrainState | undefined

    if (sourceTarget === 'local') {
      const snapshot = loadSnapshotLocal(snapshotId)
      targetState = snapshot?.state
    } else {
      // TODO: Phase M8: Load from remote
      notes.push('Remote snapshot loading not yet implemented')
      return {
        success: false,
        restoredFrom: `remote_snapshot:${snapshotId}`,
        notes,
      }
    }

    if (!targetState) {
      notes.push('Failed to load target snapshot')
      return {
        success: false,
        restoredFrom: `${sourceTarget}_snapshot:${snapshotId}`,
        notes,
      }
    }

    // Step 2: Create safety snapshot (if current state exists)
    let safetySnapshotId: string | undefined

    if (currentState) {
      notes.push('Creating safety snapshot before restore...')

      const safetySnapshot = createSnapshot(currentState, 'local')
      const safetySuccess = saveSnapshotLocal(safetySnapshot)

      if (safetySuccess) {
        safetySnapshotId = safetySnapshot.metadata.snapshotId

        // Add to catalog with safety generation
        addSnapshotCatalogEntry({
          snapshotId: safetySnapshotId,
          sessionId,
          createdAt: safetySnapshot.metadata.createdAt,
          turnCount: safetySnapshot.metadata.turnCount,
          generation: 'safety',
          storageTarget: 'local',
          label: `Safety snapshot before restore from ${snapshotId}`,
        })

        notes.push(`Safety snapshot created: ${safetySnapshotId}`)
      } else {
        notes.push('Warning: Failed to create safety snapshot, but continuing...')
      }
    } else {
      notes.push('No current state, skipping safety snapshot')
    }

    // Step 3: Save restored state
    notes.push('Saving restored state...')

    const saveSuccess = await localBrainPersistence.save(targetState)

    if (!saveSuccess) {
      notes.push('Failed to save restored state')
      return {
        success: false,
        restoredFrom: `${sourceTarget}_snapshot:${snapshotId}`,
        safetySnapshotId,
        notes,
      }
    }

    // Step 4: Record in journal
    try {
      addJournalEvent({
        sessionId,
        type: 'recovery_planned', // Closest existing type
        turnCount: targetState.turnCount,
        payload: {
          action: 'restore_executed',
          source: `${sourceTarget}_snapshot`,
          snapshotId,
          safetySnapshotId,
          restoredTurnCount: targetState.turnCount,
        },
      })
      notes.push('Restore recorded in journal')
    } catch {
      notes.push('Warning: Failed to record restore in journal')
    }

    notes.push(`Successfully restored from ${sourceTarget} snapshot ${snapshotId}`)
    notes.push(`Restored state is at turn ${targetState.turnCount}`)

    return {
      success: true,
      restoredFrom: `${sourceTarget}_snapshot:${snapshotId}`,
      safetySnapshotId,
      notes,
    }
  } catch (error) {
    notes.push(`Error during restore: ${error}`)
    return {
      success: false,
      restoredFrom: `${sourceTarget}_snapshot:${snapshotId}`,
      notes,
    }
  }
}

/**
 * Restore from latest remote state
 * Creates safety snapshot before restoring
 */
export const restoreFromLatestRemote = async (
  sessionId: string,
  currentState: SessionBrainState | undefined
): Promise<RestoreExecutionResult> => {
  const notes: string[] = []

  try {
    const config = getPersistenceConfig()

    if (!config.remoteEnabled) {
      notes.push('Remote persistence is not enabled')
      return {
        success: false,
        restoredFrom: 'latest_remote',
        notes,
      }
    }

    // Step 1: Load remote state
    notes.push('Loading latest remote state...')

    const remoteState = await remoteBrainPersistence.load(sessionId)

    if (!remoteState) {
      notes.push('No remote state found')
      return {
        success: false,
        restoredFrom: 'latest_remote',
        notes,
      }
    }

    // Step 2: Create safety snapshot (if current state exists and different)
    let safetySnapshotId: string | undefined

    if (currentState && currentState.updatedAt !== remoteState.updatedAt) {
      notes.push('Creating safety snapshot before restore...')

      const safetySnapshot = createSnapshot(currentState, 'local')
      const safetySuccess = saveSnapshotLocal(safetySnapshot)

      if (safetySuccess) {
        safetySnapshotId = safetySnapshot.metadata.snapshotId

        addSnapshotCatalogEntry({
          snapshotId: safetySnapshotId,
          sessionId,
          createdAt: safetySnapshot.metadata.createdAt,
          turnCount: safetySnapshot.metadata.turnCount,
          generation: 'safety',
          storageTarget: 'local',
          label: 'Safety snapshot before restore from remote',
        })

        notes.push(`Safety snapshot created: ${safetySnapshotId}`)
      }
    }

    // Step 3: Save remote state locally
    notes.push('Saving remote state locally...')

    const saveSuccess = await localBrainPersistence.save(remoteState)

    if (!saveSuccess) {
      notes.push('Failed to save remote state locally')
      return {
        success: false,
        restoredFrom: 'latest_remote',
        safetySnapshotId,
        notes,
      }
    }

    notes.push('Successfully restored from latest remote state')
    notes.push(`Restored state is at turn ${remoteState.turnCount}`)

    return {
      success: true,
      restoredFrom: 'latest_remote',
      safetySnapshotId,
      notes,
    }
  } catch (error) {
    notes.push(`Error during restore: ${error}`)
    return {
      success: false,
      restoredFrom: 'latest_remote',
      notes,
    }
  }
}

/**
 * Restore from latest local state
 * Mainly used to reload from localStorage
 */
export const restoreFromLatestLocal = async (
  sessionId: string
): Promise<RestoreExecutionResult> => {
  const notes: string[] = []

  try {
    // Step 1: Load local state
    notes.push('Loading latest local state...')

    const localState = await localBrainPersistence.load(sessionId)

    if (!localState) {
      notes.push('No local state found')
      return {
        success: false,
        restoredFrom: 'latest_local',
        notes,
      }
    }

    // No safety snapshot needed when reloading local state
    notes.push('Reloaded local state successfully')
    notes.push(`State is at turn ${localState.turnCount}`)

    return {
      success: true,
      restoredFrom: 'latest_local',
      notes,
    }
  } catch (error) {
    notes.push(`Error during restore: ${error}`)
    return {
      success: false,
      restoredFrom: 'latest_local',
      notes,
    }
  }
}

/**
 * Create a manual snapshot with a label
 * Useful for creating marked restore points
 */
export const createManualSnapshot = async (
  state: SessionBrainState,
  label?: string
): Promise<{ success: boolean; snapshotId?: string; notes: string[] }> => {
  const notes: string[] = []

  try {
    const snapshot = createSnapshot(state, 'local')
    const success = saveSnapshotLocal(snapshot)

    if (success) {
      const snapshotId = snapshot.metadata.snapshotId

      addSnapshotCatalogEntry({
        snapshotId,
        sessionId: state.sessionId,
        createdAt: snapshot.metadata.createdAt,
        turnCount: snapshot.metadata.turnCount,
        generation: 'manual',
        storageTarget: 'local',
        label: label ?? `Manual snapshot at turn ${state.turnCount}`,
      })

      notes.push(`Manual snapshot created: ${snapshotId}`)

      return {
        success: true,
        snapshotId,
        notes,
      }
    } else {
      notes.push('Failed to save manual snapshot')
      return {
        success: false,
        notes,
      }
    }
  } catch (error) {
    notes.push(`Error creating manual snapshot: ${error}`)
    return {
      success: false,
      notes,
    }
  }
}
