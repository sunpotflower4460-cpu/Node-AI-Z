/**
 * Three-layer learning types for Signal-Centered Crystallization Runtime v1
 *
 * 三層学習:
 *   Session  – セッション内 (ephemeral, in-memory, lost at session end)
 *   Personal – 個別 (persisted per user across sessions)
 *   Global   – 全体候補 (candidate pool for global weight promotion)
 */

/** Maps a pathway key (e.g. "signal_id:trigger" or "signal_id") to a strength delta (0.0–1.0) */
export type PathwayStrengthMap = Record<string, number>

/** Session-level learning state: ephemeral, discarded when the session ends */
export type SessionLearningState = {
  /** Opaque identifier for this session */
  sessionId: string
  /** Cumulative strength boosts for pathway keys fired this session */
  pathwayStrengths: PathwayStrengthMap
  /** Deduplicated list of every pathway key that fired at least once */
  reinforcedKeys: string[]
  /** Number of turns processed in this session */
  turnCount: number
}

/** Personal learning state: persisted across sessions for a single user */
export type PersonalLearningState = {
  /** Cumulative strength boosts for pathway keys, slower to build than session */
  pathwayStrengths: PathwayStrengthMap
  /** ISO timestamp of last update */
  lastUpdated: string
  /** Total turns processed across all sessions */
  totalTurns: number
}

/** A single candidate for global weight promotion */
export type GlobalLearningCandidate = {
  /** Pathway key being nominated */
  key: string
  /** Suggested weight delta */
  delta: number
  /** Human-readable reason for nomination */
  reason: string
  /** Session that generated this nomination */
  sessionId: string
  /** ISO timestamp of nomination */
  timestamp: string
}

/** Global candidate pool: nominated pathway updates awaiting promotion review */
export type GlobalCandidateState = {
  candidates: GlobalLearningCandidate[]
  /** ISO timestamp of last mutation */
  lastUpdated: string
}

/** Combined three-layer learning state passed through the runtime */
export type LearningLayers = {
  session: SessionLearningState
  personal: PersonalLearningState
  globalCandidates: GlobalCandidateState
}
