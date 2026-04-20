/**
 * Journal Writer
 * Records brain state change events for recovery and audit
 *
 * Phase M6: Journal infrastructure for remote persistence
 */

import type { JournalEvent, JournalEventType } from './types'

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
 * Append a journal event
 */
export const appendJournalEvent = (event: JournalEvent): boolean => {
  try {
    const events = loadJournalEvents()
    events.push(event)
    return saveJournalEvents(events)
  } catch (error) {
    console.warn('Failed to append journal event:', error)
    return false
  }
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
