/**
 * Journal Replay
 * Minimal version of journal replay for recovery assistance
 *
 * Phase M8: Snapshot generation management
 */

import type { JournalEvent } from './types'
import { getSessionJournalEvents, listAllJournalEvents } from './journalWriter'
import { getPersistenceConfig } from '../../config/persistenceEnv'

/**
 * Journal replay candidate
 * Represents a potential recovery point from journal events
 */
export type JournalReplayCandidate = {
  eventId: string
  turnCount: number
  createdAt: number
  eventType: string
  description: string
  confidence: number // 0-1, how confident we are this is a good recovery point
}

/**
 * Get journal replay candidates for a session
 * Returns potential recovery points based on journal events
 */
export const getJournalReplayCandidates = async (
  sessionId: string
): Promise<JournalReplayCandidate[]> => {
  const config = getPersistenceConfig()

  // Get all journal events for session
  let events: JournalEvent[]

  try {
    events = await listAllJournalEvents(sessionId)
  } catch {
    // Fall back to local only
    events = getSessionJournalEvents(sessionId)
  }

  if (events.length === 0) {
    return []
  }

  const candidates: JournalReplayCandidate[] = []

  // Strategy: Look for significant events that could serve as recovery points
  for (const event of events) {
    let confidence = 0
    let description = ''

    switch (event.type) {
      case 'brain_saved':
        confidence = 0.8
        description = `Brain state saved at turn ${event.turnCount}`
        break

      case 'snapshot_created':
        confidence = 0.9
        description = `Snapshot created at turn ${event.turnCount}`
        break

      case 'schema_reinforced':
        confidence = 0.6
        description = `Schema reinforced at turn ${event.turnCount}`
        break

      case 'schema_promoted':
        confidence = 0.7
        description = `Schema promoted at turn ${event.turnCount}`
        break

      case 'episodic_added':
        confidence = 0.5
        description = `Episodic trace added at turn ${event.turnCount}`
        break

      case 'recovery_planned':
        confidence = 0.85
        description = `Recovery planned at turn ${event.turnCount}`
        break

      default:
        confidence = 0.3
        description = `Event ${event.type} at turn ${event.turnCount}`
    }

    // Higher confidence for recent events
    const age = Date.now() - event.createdAt
    const dayAge = age / (1000 * 60 * 60 * 24)

    if (dayAge < 1) {
      confidence *= 1.2
    } else if (dayAge < 7) {
      confidence *= 1.0
    } else {
      confidence *= 0.8
    }

    // Cap at 1.0
    confidence = Math.min(confidence, 1.0)

    candidates.push({
      eventId: event.id,
      turnCount: event.turnCount,
      createdAt: event.createdAt,
      eventType: event.type,
      description,
      confidence,
    })
  }

  // Sort by confidence (highest first) then by createdAt (newest first)
  candidates.sort((a, b) => {
    if (Math.abs(a.confidence - b.confidence) > 0.1) {
      return b.confidence - a.confidence
    }
    return b.createdAt - a.createdAt
  })

  if (config.debug) {
    console.log(`Found ${candidates.length} journal replay candidates for session ${sessionId}`)
  }

  return candidates
}

/**
 * Get the most recent significant journal events
 * Useful for understanding recent state changes
 */
export const getRecentJournalSummary = async (
  sessionId: string,
  limit: number = 10
): Promise<{
  recentEvents: JournalEvent[]
  lastBrainSave?: JournalEvent
  lastSnapshot?: JournalEvent
  eventCounts: Record<string, number>
}> => {
  // Get all journal events for session
  let events: JournalEvent[]

  try {
    events = await listAllJournalEvents(sessionId)
  } catch {
    // Fall back to local only
    events = getSessionJournalEvents(sessionId)
  }

  // Sort by createdAt descending
  const sortedEvents = [...events].sort((a, b) => b.createdAt - a.createdAt)

  // Get recent events
  const recentEvents = sortedEvents.slice(0, limit)

  // Find last brain save
  const lastBrainSave = sortedEvents.find(e => e.type === 'brain_saved')

  // Find last snapshot
  const lastSnapshot = sortedEvents.find(e => e.type === 'snapshot_created')

  // Count events by type
  const eventCounts: Record<string, number> = {}
  for (const event of events) {
    eventCounts[event.type] = (eventCounts[event.type] ?? 0) + 1
  }

  return {
    recentEvents,
    lastBrainSave,
    lastSnapshot,
    eventCounts,
  }
}

/**
 * Estimate how far back we can replay from journal
 * Returns the earliest recoverable turn count
 */
export const estimateJournalRecoverableRange = async (
  sessionId: string
): Promise<{
  earliestTurn: number | undefined
  latestTurn: number | undefined
  totalEvents: number
  coverage: number // 0-1, estimate of how complete the journal is
}> => {
  // Get all journal events for session
  let events: JournalEvent[]

  try {
    events = await listAllJournalEvents(sessionId)
  } catch {
    // Fall back to local only
    events = getSessionJournalEvents(sessionId)
  }

  if (events.length === 0) {
    return {
      earliestTurn: undefined,
      latestTurn: undefined,
      totalEvents: 0,
      coverage: 0,
    }
  }

  // Find turn range
  const turnCounts = events.map(e => e.turnCount)
  const earliestTurn = Math.min(...turnCounts)
  const latestTurn = Math.max(...turnCounts)

  // Estimate coverage
  // Simple heuristic: check how many turns have at least one event
  const turnsWithEvents = new Set(turnCounts)
  const totalTurns = latestTurn - earliestTurn + 1
  const coverage = turnsWithEvents.size / totalTurns

  return {
    earliestTurn,
    latestTurn,
    totalEvents: events.length,
    coverage,
  }
}

/**
 * Check if journal replay is viable for recovery
 * Returns true if we have enough journal events to attempt recovery
 */
export const isJournalReplayViable = async (
  sessionId: string,
  minEvents: number = 5,
  minCoverage: number = 0.3
): Promise<boolean> => {
  const range = await estimateJournalRecoverableRange(sessionId)

  return range.totalEvents >= minEvents && range.coverage >= minCoverage
}

/**
 * Get journal events for a specific turn range
 * Useful for targeted replay
 */
export const getJournalEventsInRange = async (
  sessionId: string,
  startTurn: number,
  endTurn: number
): Promise<JournalEvent[]> => {
  // Get all journal events for session
  let events: JournalEvent[]

  try {
    events = await listAllJournalEvents(sessionId)
  } catch {
    // Fall back to local only
    events = getSessionJournalEvents(sessionId)
  }

  // Filter by turn range
  return events.filter(
    e => e.turnCount >= startTurn && e.turnCount <= endTurn
  ).sort((a, b) => a.turnCount - b.turnCount)
}
