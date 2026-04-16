/**
 * Integrated Signal Runtime v2.1 — Chunk + Feature + ActivationProfile types
 */

/** Smallest autonomous semantic unit extracted from raw input text */
export type MeaningChunk = {
  text: string
  index: number
}

/** Small semantic firing that precedes Node activation */
export type ChunkFeature = {
  id: string
  strength: number // 0-1 after inhibition / thresholding
  rawStrength: number // strength before inhibition
  sourceChunkIndices: number[] // which MeaningChunk indices contributed
  // ── ISR v2.2 temporal fields ─────────────────────────────────────────────
  /** Turn number of last firing; undefined if feature has never fired before */
  lastFiredTurn?: number
  /** Per-feature exponential decay rate (0.05 – 0.25); defaults to 0.1 */
  decayRate?: number
  /** Feature is in refractory until this turn number; defaults to -Infinity */
  refractoryUntilTurn?: number
}

/** Dynamic activation threshold derived from recent activity level */
export type DynamicThreshold = {
  base: number
  current: number
  recentActivityScore: number
}

import type { RecurrentLoopResult } from './temporalTypes'

/** Full result of the pre-Node chunk → feature → activation stage */
export type ChunkedPipelineStage = {
  chunks: MeaningChunk[]
  rawFeatures: ChunkFeature[]
  /** Features after temporal decay is applied (ISR v2.2) */
  decayedFeatures: ChunkFeature[]
  /** Features after refractory gating (ISR v2.2) */
  refractoryFeatures: ChunkFeature[]
  inhibitedFeatures: ChunkFeature[]
  threshold: DynamicThreshold
  /** Features after recurrent self loop (ISR v2.2) */
  recurrentResult: RecurrentLoopResult<ChunkFeature[]>
  /** Features after lateral inhibition (ISR v2.2) */
  lateralInhibitedFeatures: ChunkFeature[]
  activeFeatures: ChunkFeature[] // features that cleared the threshold
  debugNotes: string[]
}
