/**
 * Journal Writer
 * Records brain state change events for recovery and audit
 *
 * Phase M7: Remote journal writing
 */

import type { JournalEvent, JournalEventType } from './types'
import { appendJournalEvent as appendRemoteJournalEvent, listRecentJournalEvents as listRemoteJournalEvents } from './backendClient'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Generate a unique journal event ID
 */
const generateEventId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `event-${timestamp}-${random}`
}

/**
 * Create a journal event
 */
export const createJournalEvent = (
  sessionId: string,
  turnCount: number,
  type: JournalEventType,
  payload: Record<string, unknown> = {},
): JournalEvent => {
  return {
    id: generateEventId(),
    sessionId,
    type,
    createdAt: Date.now(),
    turnCount,
    payload,
  }
}

/**
 * Storage key for journal events
 */
const JOURNAL_STORAGE_KEY = 'nodeaiz:crystal:journal'

/**
 * Load all journal events from localStorage
 */
export const loadJournalEvents = (): JournalEvent[] => {
  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to load journal events:', error)
    return []
  }
}

/**
 * Save journal events to localStorage
 */
const saveJournalEvents = (events: JournalEvent[]): boolean => {
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(events))
    return true
  } catch (error) {
    console.warn('Failed to save journal events:', error)
    return false
  }
}

/**
 * Append a journal event to both local and remote storage (Phase M7)
 * Returns true if at least local save succeeded
 */
export const appendJournalEvent = async (event: JournalEvent): Promise<boolean> => {
  const config = getPersistenceConfig()

  let localSuccess = false
  let remoteSuccess = false

  // Save to local
  try {
    const events = loadJournalEvents()
    events.push(event)
    localSuccess = saveJournalEvents(events)
    if (config.debug) {
      console.log(`Journal local append: ${localSuccess ? 'success' : 'failed'}`)
    }
  } catch (error) {
    console.warn('Failed to append journal event locally:', error)
  }

  // Save to remote if enabled
  if (config.remoteEnabled) {
    try {
      remoteSuccess = await appendRemoteJournalEvent(event)
      if (config.debug) {
        console.log(`Journal remote append: ${remoteSuccess ? 'success' : 'failed'}`)
      }
    } catch (error) {
      console.warn('Failed to append journal event remotely:', error)
    }
  }

  // Return true if at least local save succeeded
  return localSuccess
}

/**
 * Get journal events for a specific session
 */
export const getSessionJournalEvents = (sessionId: string): JournalEvent[] => {
  const allEvents = loadJournalEvents()
  return allEvents.filter(event => event.sessionId === sessionId)
}

/**
 * Get journal events after a specific turn
 */
export const getJournalEventsAfterTurn = (
  sessionId: string,
  turnCount: number,
): JournalEvent[] => {
  const sessionEvents = getSessionJournalEvents(sessionId)
  return sessionEvents.filter(event => event.turnCount > turnCount)
}

/**
 * Prune old journal events (keep only recent maxEntries)
 */
export const pruneJournalEvents = (maxEntries: number): void => {
  try {
    const events = loadJournalEvents()
    if (events.length <= maxEntries) {
      return
    }

    // Keep only the most recent maxEntries
    const pruned = events
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, maxEntries)

    saveJournalEvents(pruned)
  } catch (error) {
    console.warn('Failed to prune journal events:', error)
  }
}

/**
 * Clear all journal events for a session
 */
export const clearSessionJournal = (sessionId: string): boolean => {
  try {
    const allEvents = loadJournalEvents()
    const filtered = allEvents.filter(event => event.sessionId !== sessionId)
    return saveJournalEvents(filtered)
  } catch (error) {
    console.warn('Failed to clear session journal:', error)
    return false
  }
}

/**
 * Record a brain save event
 */
export const recordBrainSaved = (
  sessionId: string,
  turnCount: number,
  success: boolean,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'brain_saved', { success })
  appendJournalEvent(event)
}

/**
 * Record a snapshot created event
 */
export const recordSnapshotCreated = (
  sessionId: string,
  turnCount: number,
  snapshotId: string,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'snapshot_created', { snapshotId })
  appendJournalEvent(event)
}

/**
 * Record an episodic trace added event
 */
export const recordEpisodicAdded = (
  sessionId: string,
  turnCount: number,
  traceCount: number,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'episodic_added', { traceCount })
  appendJournalEvent(event)
}

/**
 * Record a schema promoted event
 */
export const recordSchemaPromoted = (
  sessionId: string,
  turnCount: number,
  schemaId: string,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'schema_promoted', { schemaId })
  appendJournalEvent(event)
}

/**
 * Record a schema reinforced event
 */
export const recordSchemaReinforced = (
  sessionId: string,
  turnCount: number,
  schemaId: string,
  strength: number,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'schema_reinforced', {
    schemaId,
    strength,
  })
  appendJournalEvent(event)
}

/**
 * Record a workspace changed event
 */
export const recordWorkspaceChanged = (
  sessionId: string,
  turnCount: number,
  phase: string,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'workspace_changed', { phase })
  appendJournalEvent(event)
}

/**
 * Record a mixed node selected event
 */
export const recordMixedNodeSelected = (
  sessionId: string,
  turnCount: number,
  nodeId: string,
  salience: number,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'mixed_node_selected', {
    nodeId,
    salience,
  })
  appendJournalEvent(event)
}

/**
 * Record a recovery planned event
 */
export const recordRecoveryPlanned = (
  sessionId: string,
  turnCount: number,
  source: string,
): void => {
  const event = createJournalEvent(sessionId, turnCount, 'recovery_planned', { source })
  appendJournalEvent(event)
}

/**
 * List all journal events for a session (Phase M7)
 * Combines local and remote journal events
 */
export const listAllJournalEvents = async (
  sessionId: string,
  limit: number = 50,
): Promise<JournalEvent[]> => {
  const config = getPersistenceConfig()

  // Get local events
  const localEvents = getSessionJournalEvents(sessionId)

  // Get remote events if enabled
  let remoteEvents: JournalEvent[] = []
  if (config.remoteEnabled) {
    try {
      remoteEvents = await listRemoteJournalEvents(sessionId, limit)
    } catch (error) {
      console.warn('Failed to list remote journal events:', error)
    }
  }

  // Merge and deduplicate by event ID
  const allEvents = [...localEvents, ...remoteEvents]
  const uniqueEvents = new Map<string, JournalEvent>()

  for (const event of allEvents) {
    // Keep the one with the latest createdAt if duplicates
    const existing = uniqueEvents.get(event.id)
    if (!existing || event.createdAt > existing.createdAt) {
      uniqueEvents.set(event.id, event)
    }
  }

  // Sort by createdAt descending and limit
  return Array.from(uniqueEvents.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}
