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
}

/** Dynamic activation threshold derived from recent activity level */
export type DynamicThreshold = {
  base: number
  current: number
  recentActivityScore: number
}

/** Full result of the pre-Node chunk → feature → activation stage */
export type ChunkedPipelineStage = {
  chunks: MeaningChunk[]
  rawFeatures: ChunkFeature[]
  inhibitedFeatures: ChunkFeature[]
  threshold: DynamicThreshold
  activeFeatures: ChunkFeature[] // features that cleared the threshold
  debugNotes: string[]
}
