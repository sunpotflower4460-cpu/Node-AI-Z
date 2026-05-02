import type { SensoryPacket } from './sensoryPacketTypes'
import { extractTextFeatures } from './extractors/extractTextFeatures'
import { normalizeSensoryPacket } from './normalizeSensoryPacket'

/**
 * Creates a SensoryPacket from a raw text string.
 * Extracts low-level structural features (no semantic labels).
 */
export function createTextSensoryPacket(
  text: string,
  options: {
    source?: SensoryPacket['source']
    isTeacherInjected?: boolean
    timestamp?: number
    metadata?: Record<string, unknown>
  } = {},
): SensoryPacket {
  const {
    source = 'external',
    isTeacherInjected = false,
    timestamp = Date.now(),
    metadata,
  } = options

  const features = extractTextFeatures(text)

  const raw: SensoryPacket = {
    id: `sensory_text_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: timestamp,
    modality: 'text',
    source,
    rawSummary: {
      kind: 'text',
      size: text.length,
      description: text.slice(0, 60),
    },
    features,
    confidence: {
      extractionConfidence: text.length > 0 ? 0.95 : 0.1,
      modalityConfidence: 1.0,
    },
    tags: {
      isExternal: source === 'external',
      isSynthetic: source === 'self_generated',
      isTeacherInjected,
      isReplay: source === 'internal_replay',
    },
    ...(metadata ? { metadata } : {}),
  }

  return normalizeSensoryPacket(raw)
}
