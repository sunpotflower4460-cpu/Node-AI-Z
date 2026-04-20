/**
 * Backend Client for Remote Persistence
 * Minimal implementation using Supabase
 *
 * Phase M7: Real remote backend connection
 *
 * This abstracts backend-specific code from the persistence adapters,
 * making it easy to swap backends in the future.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SessionBrainState } from '../sessionBrainState'
import type {
  RemoteBrainRecord,
  RemoteSnapshotRecord,
  RemoteJournalRecord,
} from './backendTypes'
import type { SnapshotMetadata, JournalEvent } from './types'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Supabase table names
 */
const TABLES = {
  BRAIN_STATES: 'brain_states',
  SNAPSHOTS: 'snapshots',
  JOURNAL: 'journal_events',
} as const

/**
 * Backend client singleton
 */
let supabaseClient: SupabaseClient | null = null

/**
 * Initialize Supabase client
 * Returns null if configuration is not available
 */
const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient
  }

  const config = getPersistenceConfig()

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    if (config.debug) {
      console.warn('Supabase configuration not available')
    }
    return null
  }

  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    if (config.debug) {
      console.log('Supabase client initialized')
    }
    return supabaseClient
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return null
  }
}

/**
 * Load brain state from remote backend
 */
export const loadBrainState = async (
  sessionId: string,
): Promise<SessionBrainState | undefined> => {
  const client = getSupabaseClient()
  if (!client) {
    return undefined
  }

  try {
    const { data, error } = await client
      .from(TABLES.BRAIN_STATES)
      .select('*')
      .eq('sessionId', sessionId)
      .order('updatedAt', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // No data found is not an error, just return undefined
      if (error.code === 'PGRST116') {
        return undefined
      }
      console.warn('Failed to load brain state from remote:', error)
      return undefined
    }

    if (!data) {
      return undefined
    }

    const record = data as RemoteBrainRecord
    return record.brainState
  } catch (error) {
    console.warn('Exception loading brain state from remote:', error)
    return undefined
  }
}

/**
 * Save brain state to remote backend
 */
export const saveBrainState = async (state: SessionBrainState): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  try {
    const record: RemoteBrainRecord = {
      sessionId: state.sessionId,
      updatedAt: Date.now(),
      brainState: state,
    }

    const { error } = await client
      .from(TABLES.BRAIN_STATES)
      .upsert(record, {
        onConflict: 'sessionId',
      })

    if (error) {
      console.warn('Failed to save brain state to remote:', error)
      return false
    }

    return true
  } catch (error) {
    console.warn('Exception saving brain state to remote:', error)
    return false
  }
}

/**
 * Clear brain state from remote backend
 */
export const clearBrainState = async (sessionId: string): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  try {
    const { error } = await client
      .from(TABLES.BRAIN_STATES)
      .delete()
      .eq('sessionId', sessionId)

    if (error) {
      console.warn('Failed to clear brain state from remote:', error)
      return false
    }

    return true
  } catch (error) {
    console.warn('Exception clearing brain state from remote:', error)
    return false
  }
}

/**
 * Create snapshot in remote backend
 */
export const createSnapshot = async (
  state: SessionBrainState,
  metadata: SnapshotMetadata,
): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  try {
    const record: RemoteSnapshotRecord = {
      snapshotId: metadata.snapshotId,
      sessionId: state.sessionId,
      createdAt: metadata.createdAt,
      metadata,
      brainState: state,
    }

    const { error } = await client.from(TABLES.SNAPSHOTS).insert(record)

    if (error) {
      console.warn('Failed to create snapshot in remote:', error)
      return false
    }

    return true
  } catch (error) {
    console.warn('Exception creating snapshot in remote:', error)
    return false
  }
}

/**
 * List snapshots from remote backend
 */
export const listSnapshots = async (
  sessionId: string,
): Promise<SnapshotMetadata[]> => {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  try {
    const { data, error } = await client
      .from(TABLES.SNAPSHOTS)
      .select('metadata')
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: false })

    if (error) {
      console.warn('Failed to list snapshots from remote:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map((row: { metadata: SnapshotMetadata }) => row.metadata)
  } catch (error) {
    console.warn('Exception listing snapshots from remote:', error)
    return []
  }
}

/**
 * Load snapshot from remote backend
 */
export const loadSnapshot = async (
  snapshotId: string,
): Promise<SessionBrainState | undefined> => {
  const client = getSupabaseClient()
  if (!client) {
    return undefined
  }

  try {
    const { data, error } = await client
      .from(TABLES.SNAPSHOTS)
      .select('brainState')
      .eq('snapshotId', snapshotId)
      .single()

    if (error) {
      console.warn('Failed to load snapshot from remote:', error)
      return undefined
    }

    if (!data) {
      return undefined
    }

    return (data as RemoteSnapshotRecord).brainState
  } catch (error) {
    console.warn('Exception loading snapshot from remote:', error)
    return undefined
  }
}

/**
 * Append journal event to remote backend
 */
export const appendJournalEvent = async (event: JournalEvent): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  try {
    const record: RemoteJournalRecord = event

    const { error } = await client.from(TABLES.JOURNAL).insert(record)

    if (error) {
      console.warn('Failed to append journal event to remote:', error)
      return false
    }

    return true
  } catch (error) {
    console.warn('Exception appending journal event to remote:', error)
    return false
  }
}

/**
 * List recent journal events from remote backend
 */
export const listRecentJournalEvents = async (
  sessionId: string,
  limit: number = 50,
): Promise<JournalEvent[]> => {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  try {
    const { data, error } = await client
      .from(TABLES.JOURNAL)
      .select('*')
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Failed to list journal events from remote:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data as JournalEvent[]
  } catch (error) {
    console.warn('Exception listing journal events from remote:', error)
    return []
  }
}

/**
 * Check if backend is available
 */
export const isBackendAvailable = async (): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  try {
    // Simple health check - try to query the brain_states table
    const { error } = await client
      .from(TABLES.BRAIN_STATES)
      .select('sessionId')
      .limit(1)

    return !error
  } catch {
    return false
  }
}
