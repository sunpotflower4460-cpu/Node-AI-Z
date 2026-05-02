import type { SensoryPacket } from './sensoryPacketTypes'
import { extractAudioFeatures } from './extractors/extractAudioFeatures'
import { createAudioMockFeatures } from './extractors/createAudioMockFeatures'
import { normalizeSensoryPacket } from './normalizeSensoryPacket'

/**
 * Creates a SensoryPacket from an AudioBuffer or a mock description.
 *
 * When `buffer` is provided, extracts real waveform features.
 * When `buffer` is null/undefined, produces a lightweight mock feature set.
 */
export function createAudioSensoryPacket(
  buffer: AudioBuffer | null | undefined,
  options: {
    source?: SensoryPacket['source']
    isTeacherInjected?: boolean
    timestamp?: number
    description?: string
    metadata?: Record<string, unknown>
  } = {},
): SensoryPacket {
  const {
    source: packetSource = 'external',
    isTeacherInjected = false,
    timestamp = Date.now(),
    description,
    metadata,
  } = options

  const isMock = !buffer || buffer.length === 0
  const features = isMock
    ? createAudioMockFeatures(description)
    : extractAudioFeatures(buffer)

  const durationMs = buffer ? (buffer.length / buffer.sampleRate) * 1000 : undefined

  const raw: SensoryPacket = {
    id: `sensory_audio_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: timestamp,
    modality: 'audio',
    source: packetSource,
    rawSummary: {
      kind: isMock ? 'audio_mock' : 'audio',
      size: buffer?.length,
      durationMs,
      description: description ?? (isMock ? 'mock audio' : `${durationMs?.toFixed(0) ?? '?'}ms`),
    },
    features,
    confidence: {
      extractionConfidence: isMock ? 0.25 : 0.85,
      modalityConfidence: 1.0,
    },
    tags: {
      isExternal: packetSource === 'external',
      isSynthetic: packetSource === 'self_generated',
      isTeacherInjected,
      isReplay: packetSource === 'internal_replay',
    },
    ...(metadata ? { metadata } : {}),
  }

  return normalizeSensoryPacket(raw)
}
