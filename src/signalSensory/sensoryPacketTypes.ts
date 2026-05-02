/**
 * Sensory Packet Types — Phase 2 Multimodal Input Foundation
 *
 * All external inputs (text, image, audio, synthetic stimuli) are converted into
 * a common SensoryPacket before being injected into the Signal Field.
 * No semantic meaning is assigned here — only low-level structural features.
 */

/** All modality kinds supported or planned */
export type SensoryModality =
  | 'text'
  | 'image'
  | 'audio'
  | 'event'
  | 'synthetic_text'
  | 'synthetic_image'
  | 'synthetic_audio'

/** Source classification for source-aware signal flow */
export type SensorySource =
  | 'external'
  | 'internal_replay'
  | 'teacher'
  | 'self_generated'

/**
 * Low-dimensional feature vector extracted from a sensory input.
 * Always normalized to [0, 1]. No semantic labels.
 */
export type SensoryFeatureVector = {
  values: number[]
  dimension: number
  normalized: boolean
  featureNames?: string[]
}

/** Common sensory packet that wraps any modality input for Signal Field injection */
export type SensoryPacket = {
  id: string
  createdAt: number
  modality: SensoryModality
  source: SensorySource
  rawSummary: {
    kind: string
    size?: number
    durationMs?: number
    description?: string
  }
  features: SensoryFeatureVector
  confidence: {
    extractionConfidence: number
    modalityConfidence: number
  }
  tags: {
    isExternal: boolean
    isSynthetic: boolean
    isTeacherInjected: boolean
    isReplay: boolean
  }
  metadata?: Record<string, unknown>
}

/** Number of feature dimensions used for all modalities */
export const SENSORY_FEATURE_DIM = 8
