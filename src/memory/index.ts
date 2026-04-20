/**
 * Memory Module
 * Phase M4: Episodic / Schema / Replay separation
 *
 * Exports all memory-related types and functions.
 */

export type {
  EpisodicTrace,
  SchemaPattern,
  SchemaMemoryState,
  ReplayCandidate,
  ReplayConsolidationResult,
  SchemaInfluenceNote,
} from './types'

export { createEpisodicTrace } from './episodicMemory'
export type { CreateEpisodicTraceInput } from './episodicMemory'

export { pruneEpisodicBuffer } from './pruneEpisodicBuffer'
export type { PruneEpisodicBufferInput } from './pruneEpisodicBuffer'

export {
  generateSchemaKey,
  createSchemaPattern,
  reinforceSchemaPattern,
  findSchemaByKey,
  addSchemaPattern,
  updateSchemaPattern,
  createEmptySchemaMemory,
} from './schemaMemory'

export { deriveReplayCandidates, shouldRunReplay } from './deriveReplayCandidates'
export type { DeriveReplayCandidatesInput } from './deriveReplayCandidates'

export { runReplayConsolidation } from './replayConsolidation'
export type { ReplayConsolidationInput } from './replayConsolidation'

export { applySchemaInfluence } from './applySchemaInfluence'
export type { ApplySchemaInfluenceInput } from './applySchemaInfluence'
