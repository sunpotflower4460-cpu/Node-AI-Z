/**
 * Backend Types for Remote Persistence
 * Defines the data structures for remote storage
 *
 * Phase M7: Real remote backend implementation
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { SnapshotMetadata, JournalEvent } from './types'

/**
 * Remote brain state record
 * Stores the current brain state in remote backend
 */
export type RemoteBrainRecord = {
  sessionId: string
  updatedAt: number
  brainState: SessionBrainState
}

/**
 * Remote snapshot record
 * Stores a snapshot with its metadata
 */
export type RemoteSnapshotRecord = {
  snapshotId: string
  sessionId: string
  createdAt: number
  metadata: SnapshotMetadata
  brainState: SessionBrainState
}

/**
 * Remote journal record
 * Stores journal events
 */
export type RemoteJournalRecord = JournalEvent

/**
 * Backend save status
 */
export type SaveStatus = {
  localSuccess: boolean
  remoteSuccess: boolean
  lastLocalSaveTime?: number
  lastRemoteSaveTime?: number
  errors: string[]
}

/**
 * Persistence statistics
 */
export type PersistenceStats = {
  snapshotCount: number
  journalEventCount: number
  lastSnapshotTime?: number
  lastJournalEventTime?: number
}
