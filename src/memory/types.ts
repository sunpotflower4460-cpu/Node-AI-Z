/**
 * Memory Types
 * Phase M4: Episodic / Schema / Replay separation
 *
 * Separates one-time events (episodic) from recurring patterns (schema).
 * Replay consolidation promotes episodic traces to schema over time.
 */

/**
 * Episodic Trace
 * Represents a single meaningful event from one turn.
 * Not yet consolidated into long-term schema.
 */
export type EpisodicTrace = {
  /** Unique trace identifier */
  id: string

  /** User input text that triggered this trace */
  inputText: string

  /** Dominant proto meaning IDs from this turn */
  dominantProtoMeaningIds: string[]

  /** Dominant texture tags (e.g., 'fragility', 'heaviness', 'resonance') */
  dominantTextureTags: string[]

  /** Summary of option awareness state */
  optionSummary?: string

  /** Somatic signature key if present */
  somaticSignatureKey?: string

  /** Surprise magnitude (0.0 - 1.0) */
  surprise?: number

  /** Unresolved tension keys */
  unresolvedTensionKeys: string[]

  /** Turn number when this trace was created */
  createdAtTurn: number

  /** Timestamp when this trace was created */
  createdAtTime: number

  /** Salience score (0.0 - 1.0) - how important this trace is */
  salience: number

  /** Number of times this trace has been replayed */
  replayCount: number

  /** Whether this trace has been consolidated into a schema */
  consolidated: boolean
}

/**
 * Schema Pattern
 * Represents a recurring pattern extracted from multiple episodic traces.
 * Emerges when similar experiences repeat over time.
 */
export type SchemaPattern = {
  /** Unique schema identifier */
  id: string

  /** Pattern key (combination of meanings/textures/tendencies) */
  key: string

  /** Dominant proto meaning IDs that characterize this pattern */
  dominantProtoMeaningIds: string[]

  /** Dominant texture tags that characterize this pattern */
  dominantTextureTags: string[]

  /** Option tendency keys (e.g., 'ambivalence', 'bridge-needed') */
  optionTendencyKeys: string[]

  /** Somatic signature keys associated with this pattern */
  somaticSignatureKeys: string[]

  /** Number of times this pattern has been observed/reinforced */
  recurrenceCount: number

  /** Pattern strength (0.0 - 1.0) */
  strength: number

  /** Pattern confidence (0.0 - 1.0) */
  confidence: number

  /** IDs of episodic traces that support this pattern */
  supportingTraceIds: string[]

  /** Turn number when this pattern was first created */
  firstSeenTurn: number

  /** Turn number when this pattern was last reinforced */
  lastReinforcedTurn: number
}

/**
 * Schema Memory State
 * Container for all schema patterns and replay metadata.
 */
export type SchemaMemoryState = {
  /** All schema patterns currently tracked */
  patterns: SchemaPattern[]

  /** Turn number when replay was last executed */
  lastReplayTurn: number

  /** Notes from recent replay operations (for Observe) */
  replayNotes: string[]
}

/**
 * Replay Candidate
 * An episodic trace selected for replay/consolidation.
 */
export type ReplayCandidate = {
  /** ID of the episodic trace to replay */
  traceId: string

  /** Candidate score (0.0 - 1.0) - higher = more worthy of replay */
  score: number

  /** Reasons why this trace was selected */
  reasons: string[]
}

/**
 * Replay Consolidation Result
 * Output from a replay consolidation operation.
 */
export type ReplayConsolidationResult = {
  /** IDs of traces that were replayed this cycle */
  replayedTraceIds: string[]

  /** New schema patterns created during consolidation */
  promotedPatterns: SchemaPattern[]

  /** IDs of existing patterns that were reinforced */
  reinforcedPatternIds: string[]

  /** IDs of traces that were archived (marked consolidated) */
  archivedTraceIds: string[]

  /** Notes describing what happened during consolidation */
  notes: string[]
}

/**
 * Schema Influence Note
 * Records how a schema pattern influenced current turn processing.
 */
export type SchemaInfluenceNote = {
  /** ID of the schema pattern that had influence */
  patternId: string

  /** What part of processing was influenced */
  target: 'fused' | 'proto' | 'option' | 'decision'

  /** Magnitude of influence (-1.0 to +1.0) */
  delta: number

  /** Reason for this influence */
  reason: string
}
